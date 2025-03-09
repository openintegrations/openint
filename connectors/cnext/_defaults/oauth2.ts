import {z} from 'zod'
import {makeUlid} from '@openint/util'
import {getServerUrl} from '../../../apps/app-config/constants'
import {
  ConnectorSchemas,
  ConnectorServer,
  extractId,
  makeId,
} from '../../../kits/cdk'
import {
  ConnectorDef,
  RefreshParams,
  TokenParams,
  zOAuthConnectorDef,
} from '../def'

type Handlers = z.infer<typeof zOAuthConnectorDef>['handlers']
type AuthorizeHandler = Handlers['authorize']
type TokenHandler = Handlers['token']
type ResponseHandler = Handlers['response']

// Helper function to make token requests
async function makeTokenRequest(
  url: string,
  params: Record<string, string>,
  flowType: 'exchange' | 'refresh',
): Promise<Response> {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
    },
    body: new URLSearchParams(params),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(
      `Token ${flowType} failed: ${response.status} ${response.statusText} - ${errorText}`,
    )
  }

  return response
}

const defaultAuthorizeHandler: AuthorizeHandler = async ({
  auth_params,
  connector_config,
  authorization_request_url,
  redirect_uri,
  connection_id,
}) => {
  if (!connection_id) {
    throw new Error('No connection_id provided')
  }
  const url = new URL(authorization_request_url)

  url.searchParams.set('response_type', 'code')
  url.searchParams.set('client_id', connector_config.client_id)
  if (connector_config.scopes) {
    url.searchParams.set('scope', connector_config.scopes.join(' '))
  }

  for (const [key, value] of Object.entries(auth_params.authorize ?? {})) {
    url.searchParams.set(key, value)
  }

  url.searchParams.set('redirect_uri', redirect_uri)
  const state = Buffer.from(connection_id).toString('base64')
  url.searchParams.set('state', state)

  return {authorization_url: url.toString()}
}

const defaultTokenHandler: TokenHandler = async (args) => {
  if (args.flow_type === 'refresh') {
    const {auth_params, connector_config, token_request_url, refresh_token} =
      args

    const baseParams = {
      grant_type: 'refresh_token',
      refresh_token,
      client_id: connector_config.client_id,
      client_secret: connector_config.client_secret,
      ...auth_params.refresh,
    }

    return makeTokenRequest(token_request_url, baseParams, 'refresh')
  } else if (args.flow_type === 'exchange') {
    const {
      auth_params,
      connector_config,
      code,
      state,
      token_request_url,
      redirect_uri,
    } = args

    const baseParams = {
      grant_type: 'authorization_code',
      code,
      client_id: connector_config.client_id,
      client_secret: connector_config.client_secret,
      redirect_uri,
      ...auth_params.token,
    }

    console.warn('SKIPPING OAUTH STATE VALIDATION: ', state)

    return makeTokenRequest(token_request_url, baseParams, 'exchange')
  }

  throw new Error(
    // @ts-expect-error
    `Invalid oauth flow type passed to token handler: ${args.flow_type}`,
  )
}

const defaultResponseHandler: ResponseHandler = async ({
  response,
  metadata,
}) => {
  return {
    access_token: response['access_token'] as string,
    refresh_token: response['refresh_token'] as string | undefined,
    expires_in: response['expires_in'] as number | undefined,
    metadata,
  }
}

function extractMetadata(
  responseData: Record<string, unknown>,
  captureFields?: string[],
): Record<string, unknown> {
  const metadata: Record<string, unknown> = {}
  if (captureFields) {
    for (const field of captureFields) {
      if (field in responseData) {
        metadata[field] = responseData[field]
      }
    }
  }
  return metadata
}

async function processTokenResponse(
  tokenResponse: Response,
  responseHandler: ResponseHandler,
  captureFields?: string[],
  existingRefreshToken?: string,
) {
  if (!responseHandler) {
    throw new Error('No response handler passed to processTokenResponse')
  }

  const responseData = await tokenResponse.json()
  const tokenMetadata = extractMetadata(responseData, captureFields)

  const processedResponse = await responseHandler({
    response: responseData,
    metadata: tokenMetadata,
  })

  const finalMetadata = extractMetadata(
    {...tokenMetadata, ...processedResponse},
    captureFields,
  )

  const expiresAt = processedResponse.expires_in
    ? new Date(Date.now() + processedResponse.expires_in * 1000).toISOString()
    : undefined

  const refreshToken = processedResponse.refresh_token || existingRefreshToken

  return {
    credentials: {
      access_token: processedResponse.access_token,
      refresh_token: refreshToken,
      expires_at: expiresAt,
      raw: {
        access_token: processedResponse.access_token,
        refresh_token: refreshToken,
        expires_at: expiresAt,
        expires_in: processedResponse.expires_in || 1800,
        token_type: 'bearer',
        type: 'OAUTH2',
      },
    },
    metadata: finalMetadata,
  }
}

export function generateOAuth2Server<T extends ConnectorSchemas>(
  connectorDef: ConnectorDef,
): ConnectorServer<T> {
  // Only use this for OAuth2 connectors
  if (
    connectorDef.auth_type !== 'OAUTH2' &&
    connectorDef.auth_type !== 'OAUTH2CC'
  ) {
    throw new Error('This server can only be used with OAuth2 connectors')
  }

  const connectorName = connectorDef.connector_name
  let clientId: string | undefined
  let clientSecret: string | undefined
  
  function addCcfgDefaultCredentials(config: any): {client_id: string; client_secret: string; scopes?: string[] | null | undefined  {
    return {
      client_id: config.client_id ?? process.env[`ccfg_${connectorName}__CLIENT_ID`],
      client_secret: config.client_secret ?? process.env[`ccfg_${connectorName}__CLIENT_SECRET`],
      scopes: config.scopes,
    }
  }

  return {
    newInstance: ({config, settings}) => {
      clientId =
        config.client_id ?? process.env[`ccfg_${connectorName}__CLIENT_ID`]
      clientSecret =
        config.client_secret ??
        process.env[`ccfg_${connectorName}__CLIENT_SECRET`]

      if (!clientId || !clientSecret) {
        throw new Error(
          `Missing client_id or client_secret for ${connectorName}`,
        )
      }

      if(settings?.oauth?.credentials?.client_id && settings?.oauth?.credentials?.client_id !== clientId) {
        throw new Error(
          `Client ID mismatch for ${connectorName}. Expected ${clientId}, got ${settings?.oauth?.credentials?.client_id}`,
        )
      }
    },
    async preConnect(connectorConfig, connectionSettings, input) {
      const authorizeHandler =
        connectorDef.handlers?.authorize || defaultAuthorizeHandler

      if (!authorizeHandler) {
        throw new Error(
          'No authorize handler defined. Has connectionSettings =' +
            !!connectionSettings,
        )
      }

      const connectionId =
        input.connectionId ??
        makeId('conn', connectorDef.connector_name, makeUlid())

      console.log(`Oauth2 Preconnect called with input`, input)

      return authorizeHandler({
        authorization_request_url: connectorDef.authorization_request_url,
        auth_params: connectorDef.auth_params,
        connector_config: connectorConfig,
        // TODO: revert
        // redirect_uri: 'https://f887-38-9-28-71.ngrok-free.app/connect/callback',
        redirect_uri: getServerUrl(null) + '/connect/callback',
        connection_id: connectionId,
        // this is currently returning T['_types']['connectInput']
        // which is defined as {authorization_url} in cnext/schema.ts
        // but TS doesn't seem to be picking it up so we're using any
      }) as any
    },

    async postConnect(connectOutput, config) {
      const tokenHandler = connectorDef.handlers?.token || defaultTokenHandler
      const responseHandler =
        connectorDef.handlers?.response || defaultResponseHandler

      if (!tokenHandler) {
        throw new Error('No token handler defined')
      }

      if (!responseHandler) {
        throw new Error('No response handler defined')
      }

      const redirect_uri = getServerUrl(null) + '/connect/callback'
      // const redirect_uri =
      //   'https://f887-38-9-28-71.ngrok-free.app/connect/callback'
      console.log(
        `Oauth2 Postconnect called with connect output`,
        connectOutput,
      )
      const tokenResponse = await tokenHandler({
        flow_type: 'exchange',
        auth_params: connectorDef.auth_params as TokenParams,
        connector_config: addCcfgDefaultCredentials(config),
        code: connectOutput.code,
        state: connectOutput.state,
        token_request_url: connectorDef.token_request_url,
        redirect_uri,
      })

      const result = await processTokenResponse(
        tokenResponse,
        responseHandler,
        connectorDef.auth_params?.capture_response_fields,
      )

      console.log(`Oauth2 Postconnect result`, result)

      return {
        // NOTE: is this the right thing to do here?
        connectionExternalId: extractId(connectOutput.connectionId)[2],
        settings: {
          oauth: {
            credentials: {
              ...result.credentials,
              client_id: config.clientSecret,
              connection_id: connectOutput.connectionId,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              last_fetched_at: new Date().toISOString(),
              provider_config_key: config.id,
              metadata: null,
            },
          },
          metadata: result.metadata,
        },
        // NOTE: this is currently returning T['_types']['connectionSettings']
        // which is defined as {authorization_url} in cnext/schema.ts
        // but TS doesn't seem to be picking it up so we're using any
      } as any
    },

    async refreshConnection(settings, config) {
      const tokenHandler = connectorDef.handlers?.token || defaultTokenHandler
      const responseHandler =
        connectorDef.handlers?.response || defaultResponseHandler

      if (!tokenHandler || !responseHandler) {
        throw new Error(
          `Missing required handlers: ${!tokenHandler ? 'token' : ''} ${
            !responseHandler ? 'response' : ''
          }`.trim(),
        )
      }

      const refreshToken = settings?.oauth?.credentials?.refresh_token
      if (!refreshToken) {
        throw new Error('No refresh token available for this connection')
      }

      console.log(
        `Oauth2 Refresh connection called `,
        // settings,
        // config,
      )

      const tokenResponse = await tokenHandler({
        flow_type: 'refresh',
        auth_params: connectorDef.auth_params as RefreshParams,
        connector_config: addCcfgDefaultCredentials(config),
        token_request_url: connectorDef.token_request_url,
        refresh_token: refreshToken,
      })
      // console.log(`Oauth2 Refresh connection token response`, tokenResponse)

      const result = await processTokenResponse(
        tokenResponse,
        responseHandler,
        connectorDef.auth_params?.capture_response_fields,
        refreshToken,
      )
      // console.log(`Oauth2 Refresh connection result`, result)

      return {
        oauth: {
          credentials: {
            ...result.credentials,
            client_id: clientId,
            connection_id: settings.oauth?.credentials?.connection_id,
            created_at: settings.oauth?.credentials?.created_at,
            updated_at: new Date().toISOString(),
            last_fetched_at: new Date().toISOString(),
            provider_config_key:
              settings.oauth?.credentials?.provider_config_key || config.id,
            metadata: settings.oauth?.credentials?.metadata || null,
          },
        },
        metadata: {
          ...settings.metadata,
          ...result.metadata,
        },
        // NOTE: this is currently returning T['_types']['connectionSettings']
      } as any
    },
  }
}

