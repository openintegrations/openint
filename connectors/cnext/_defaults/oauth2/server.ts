import {z} from 'zod'
import type {ConnectorSchemas, ConnectorServer} from '@openint/cdk'
import {extractId, makeId} from '@openint/cdk'
import {makeUlid} from '@openint/util'
// TODO: Fix me as this is technically a cyclical dep
import {getServerUrl} from '../../../../apps/app-config/constants'
import type {JsonConnectorDef} from '../../def'
import {
  AuthorizeHandler,
  OAuth2ServerOverrides,
  ResponseHandler,
  TokenHandler,
  zOAuthConnectorDef,
} from './def'

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
  params,
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

  for (const [key, value] of Object.entries(params.authorize ?? {})) {
    url.searchParams.set(key, value as string)
  }

  url.searchParams.set('redirect_uri', redirect_uri)
  const state = Buffer.from(connection_id).toString('base64')
  url.searchParams.set('state', state)

  return {authorization_url: url.toString()}
}

const defaultTokenHandler: TokenHandler = async (args) => {
  if (args.flow_type === 'refresh') {
    const {params, connector_config, token_request_url, refresh_token} = args

    const baseParams = {
      grant_type: 'refresh_token',
      refresh_token,
      client_id: connector_config.client_id,
      client_secret: connector_config.client_secret,
      ...params.refresh,
    }

    return makeTokenRequest(token_request_url, baseParams, 'refresh')
  } else if (args.flow_type === 'exchange') {
    const {
      params,
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
      ...params.token,
    }

    console.warn('SKIPPING OAUTH STATE VALIDATION: ', state)

    return makeTokenRequest(token_request_url, baseParams, 'exchange')
  }

  throw new Error(`Invalid oauth flow type passed to token handler}`)
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

function addCcfgDefaultCredentials(
  config: any,
  connectorName: string,
): {
  client_id: string
  client_secret: string
  scopes?: string[] | null | undefined
} {
  return {
    ...config,
    client_id:
      config.client_id ?? process.env[`ccfg_${connectorName}__CLIENT_ID`],
    client_secret:
      config.client_secret ??
      process.env[`ccfg_${connectorName}__CLIENT_SECRET`],
    scopes: config.scopes,
  }
}

export function isOAuth2ConnectorDef(
  auth: any,
): auth is z.infer<typeof zOAuthConnectorDef> {
  return zOAuthConnectorDef.safeParse(auth).success
}

export function generateOAuth2Server<T extends ConnectorSchemas>(
  connectorDef: JsonConnectorDef,
  overrides?: Partial<ConnectorServer<T>> & Partial<OAuth2ServerOverrides>,
): ConnectorServer<T> {
  // Only use this for OAuth2 connectors
  if (
    // TODO: connectorDef.auth.type !== 'OAUTH2CC'?
    connectorDef.auth.type !== 'OAUTH2' &&
    !isOAuth2ConnectorDef(connectorDef.auth)
  ) {
    throw new Error('This server can only be used with OAuth2 connectors')
  }

  const connectorName = connectorDef.connector_name
  let clientId: string | undefined
  let clientSecret: string | undefined

  // Create the base server implementation
  const baseServer: ConnectorServer<T> = {
    newInstance: ({config, settings}) => {
      // Use the same helper function to get credentials
      const credentials = addCcfgDefaultCredentials(config, connectorName)
      clientId = credentials.client_id
      clientSecret = credentials.client_secret

      if (!clientId || !clientSecret) {
        throw new Error(
          `Missing client_id or client_secret for ${connectorName}`,
        )
      }

      if (
        settings?.oauth?.credentials?.client_id &&
        settings?.oauth?.credentials?.client_id !== clientId
      ) {
        throw new Error(
          `Client ID mismatch for ${connectorName}. Expected ${clientId}, got ${settings?.oauth?.credentials?.client_id}`,
        )
      }
    },

    async preConnect(connectorConfig, connectionSettings, input) {
      // Use override if provided, otherwise use default
      const authorizeHandler = overrides?.authorize || defaultAuthorizeHandler

      if (!authorizeHandler) {
        throw new Error(
          'No authorize handler defined. Has connectionSettings =' +
            !!connectionSettings,
        )
      }

      if (!isOAuth2ConnectorDef(connectorDef.auth)) {
        return zOAuthConnectorDef.parse(connectorDef.auth)
      }

      const connectionId =
        input.connectionId ??
        makeId('conn', connectorDef.connector_name, makeUlid())

      console.log(`Oauth2 Preconnect called with input`, input)

      return authorizeHandler({
        authorization_request_url: connectorDef.auth.authorization_request_url,
        params: connectorDef.auth.params,
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
      // Use overrides if provided, otherwise use defaults
      const tokenHandler = overrides?.token || defaultTokenHandler
      const responseHandler = overrides?.response || defaultResponseHandler

      if (!tokenHandler) {
        throw new Error('No token handler defined')
      }

      if (!responseHandler) {
        throw new Error('No response handler defined')
      }

      if (!isOAuth2ConnectorDef(connectorDef.auth)) {
        return zOAuthConnectorDef.parse(connectorDef.auth)
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
        params: connectorDef.auth.params,
        connector_config: addCcfgDefaultCredentials(config, connectorName),
        code: connectOutput.code,
        state: connectOutput.state,
        token_request_url: connectorDef.auth.token_request_url,
        redirect_uri,
      })

      const result = await processTokenResponse(tokenResponse, responseHandler)

      console.log(`Oauth2 Postconnect result`, result)

      return {
        // NOTE: is this the right thing to do here?
        connectionExternalId: extractId(connectOutput.connectionId)[2],
        settings: {
          oauth: {
            credentials: {
              ...result.credentials,
              client_id: clientId,
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
      // Use overrides if provided, otherwise use defaults
      const tokenHandler = overrides?.token || defaultTokenHandler
      const responseHandler = overrides?.response || defaultResponseHandler

      if (!tokenHandler || !responseHandler) {
        throw new Error(
          `Missing required handlers: ${!tokenHandler ? 'token' : ''} ${
            !responseHandler ? 'response' : ''
          }`.trim(),
        )
      }

      if (!isOAuth2ConnectorDef(connectorDef.auth)) {
        return zOAuthConnectorDef.parse(connectorDef.auth)
      }

      const refreshToken = settings?.oauth?.credentials?.refresh_token
      if (!refreshToken) {
        throw new Error('No refresh token available for this connection')
      }

      console.log(`Oauth2 Refresh connection called`)

      const tokenResponse = await tokenHandler({
        flow_type: 'refresh',
        params: connectorDef.auth.params,
        connector_config: addCcfgDefaultCredentials(config, connectorName),
        token_request_url: connectorDef.auth.token_request_url,
        refresh_token: refreshToken,
      })

      const result = await processTokenResponse(
        tokenResponse,
        responseHandler,
        connectorDef.auth.params?.capture_response_fields,
        refreshToken,
      )

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
      } as any
    },

    // @ts-expect-error QQ Figure out return types
    async checkConnection({settings, config}: {settings: any; config: any}) {
      // If there's no access token, throw an error
      if (!settings?.oauth?.credentials?.access_token) {
        throw new Error('No access token available')
      }

      // Check if token is expired based on expires_at
      const expiresAt = settings?.oauth?.credentials?.expires_at
      const refreshToken = settings?.oauth?.credentials?.refresh_token

      if ((expiresAt && new Date(expiresAt) < new Date()) || refreshToken) {
        // Token is expired, try to refresh if possible
        if (!refreshToken || !this.refreshConnection) {
          throw new Error('Token expired and no refresh token available')
        }

        try {
          // Attempt to refresh the token
          const {connectionExternalId, settings: newSettings} =
            await this.refreshConnection(settings, config)
          return {connectionExternalId, settings: newSettings, config} // Successfully refreshed
        } catch (error: any) {
          throw new Error(`Failed to refresh token: ${error.message}`)
        }
      }

      // NOTE:
      // 1) in the future we could have connector def set up a test connection url, such as /user/info
      // and then we could use that to validate the connection
      // for now we're just going to check if the token is expired and try to refresh it
      // 2) We could also support the token introspection endpoint https://www.oauth.com/oauth2-servers/token-introspection-endpoint/

      return {
        connectionExternalId: settings.oauth?.credentials?.connection_id,
        settings,
        config,
      }
    },
  }

  // Apply any server method overrides
  return {
    ...baseServer,
    ...overrides,
  }
}
