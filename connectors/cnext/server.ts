import {z} from 'zod'
import {makeUlid} from '@openint/util'
import {getServerUrl} from '../../apps/app-config/constants'
import {
  ConnectorSchemas,
  ConnectorServer,
  extractId,
  makeId,
} from '../../kits/cdk'
import {ConnectorDef, zOAuthConnectorDef} from './def'

type Handlers = z.infer<typeof zOAuthConnectorDef>['handlers']
type AuthorizeHandler = Handlers['authorize']
type TokenHandler = Handlers['token']
type ResponseHandler = Handlers['response']

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

  // console.log('preconnect creating authorize URL', url.toString(), {
  //   auth_params,
  //   connector_config,
  //   authorization_request_url,
  //   redirect_uri,
  //   connection_id,
  // })
  // Add required OAuth2 parameters
  url.searchParams.set('response_type', 'code')
  url.searchParams.set('client_id', connector_config.client_id)
  if (connector_config.scopes) {
    url.searchParams.set('scope', connector_config.scopes.join(' '))
  }

  // Add any additional auth params
  for (const [key, value] of Object.entries(auth_params.authorize ?? {})) {
    url.searchParams.set(key, value)
  }

  // QQ: add redirect url?
  url.searchParams.set('redirect_uri', redirect_uri)
  // TODO: create a separate state parameter and persist it.
  // map it to each connection in the database. Only allow using it once to avoid CSRF attacks
  const state = Buffer.from(connection_id).toString('base64')
  url.searchParams.set('state', state)

  return {authorization_url: url.toString()}
}

const defaultTokenHandler: TokenHandler = async ({
  auth_params,
  connector_config,
  code,
  state,
  token_request_url,
  redirect_uri,
}) => {
  const baseParams = {
    grant_type: 'authorization_code',
    code,
    client_id: connector_config.client_id,
    client_secret: connector_config.client_secret,
    redirect_uri,
    ...auth_params.token,
  }

  // TODO: validate state
  console.warn('SKIPPING OAUTH STATE VALIDATION: ', state)

  const response = await fetch(token_request_url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
    },
    body: new URLSearchParams(baseParams),
  })

  if (!response.ok) {
    const errorText = await response.text()
    // QQ: what type of error?
    throw new Error(
      `Token exchange failed: ${response.status} ${response.statusText} - ${errorText}`,
    )
  }

  return response
}

const defaultResponseHandler: ResponseHandler = async ({
  response,
  metadata,
}) => {
  // console.log('RECEIVED OAUTH RESPONSE: ', response)
  // TODO:
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

export function generateConnectorServerV1<T extends ConnectorSchemas>(
  connectorDef: ConnectorDef,
): ConnectorServer<T> {
  if (connectorDef.auth_type === 'OAUTH2') {
    return {
      // @ts-expect-error, QQ not sure why this isn't ok as the type appears any
      async preConnect(connectorConfig, connectionSettings, input) {
        const authorizeHandler =
          connectorDef.handlers?.authorize ?? defaultAuthorizeHandler

        if (!authorizeHandler) {
          throw new Error('No authorize handler defined')
        }

        // console.log('preconnect input', {connectorConfig, input})
        const connectionId =
          input.connectionId ??
          makeId('conn', connectorDef.connector_name, makeUlid())

        return authorizeHandler({
          authorization_request_url: connectorDef.authorization_request_url,
          auth_params: connectorDef.auth_params,
          connector_config: connectorConfig,
          // TODO: should this be default or dynamic from context.redirect_uri
          redirect_uri: getServerUrl(null) + '/connect/callback',
          // NOTE: is this the right way to create this ID with a ULID?
          connection_id: connectionId,
        })
      },
      // this is called once there is a response from the oauth provider
      // https://app.openint.dev/connect/callback?state=xxxx&code=yyyyyy&scope=zzz
      // the callback url should call postConnect but unclear on how it knows the connectionId
      // @ts-expect-error, QQ not sure why
      async postConnect(connectOutput, config, context) {
        const tokenHandler = connectorDef.handlers?.token || defaultTokenHandler

        if (!tokenHandler) {
          throw new Error('No token handler defined')
        }

        // TODO: should this be default or dynamic from context.redirect_uri
        console.warn(
          `SKIPPING USE OF CONTEXT IN OAUTH POSTCONNECT has ${Object.keys(
            context,
          )}`,
        )
        // why does this need to be passed in again?
        const redirect_uri = getServerUrl(null) + '/connect/callback'

        const tokenResponse = await tokenHandler({
          auth_params: connectorDef.auth_params,
          connector_config: config,
          code: connectOutput.code,
          state: connectOutput.state,
          token_request_url: connectorDef.token_request_url,
          redirect_uri,
        })

        // Parse the response
        if (!tokenResponse.ok) {
          // TODO: what type of error?
          throw new Error(
            `Token exchange failed: ${await tokenResponse.text()}`,
          )
        }
        const responseData = await tokenResponse.json()

        // Extract metadata from token response
        const tokenMetadata = extractMetadata(
          responseData,
          connectorDef.auth_params?.capture_response_fields,
        )

        // Process response
        const responseHandler =
          connectorDef.handlers?.response || defaultResponseHandler

        if (!responseHandler) {
          // TODO: what type of error?
          throw new Error('No response handler defined')
        }

        const processedResponse = await responseHandler({
          response: responseData,
          metadata: tokenMetadata,
        })

        // Extract additional metadata from response handler result
        const finalMetadata = extractMetadata(
          {...tokenMetadata, ...processedResponse},
          connectorDef.auth_params?.capture_response_fields,
        )

        // console.log('postconnect finalMetadata', {
        //   config,
        //   connectOutput,
        //   finalMetadata,
        //   processedResponse,
        // })

        return {
          // QQ: should we drop this or prepend with connector type somehow referencing external ones in a generic way?
          connectionExternalId: extractId(connectOutput.connectionId)[2],
          settings: {
            oauth: {
              credentials: {
                access_token: processedResponse.access_token,
                refresh_token: processedResponse.refresh_token,
                expires_at: processedResponse.expires_in
                  ? new Date(
                      Date.now() + processedResponse.expires_in * 1000,
                    ).toISOString()
                  : undefined,
                client_id: config.client_id,
                raw: {
                  access_token: processedResponse.access_token,
                  refresh_token: processedResponse.refresh_token,
                  expires_at: processedResponse.expires_in
                    ? new Date(
                        Date.now() + processedResponse.expires_in * 1000,
                      ).toISOString()
                    : undefined,
                  expires_in: processedResponse.expires_in || 1800,
                  token_type: 'bearer',
                  type: 'OAUTH2',
                },
                // Add tracking fields
                connection_id: connectOutput.connectionId,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                last_fetched_at: new Date().toISOString(),
                provider_config_key: config.id, // Default value, should probably come from config
                metadata: null, // Initialize as null as shown in the config
              },
            },
            metadata: finalMetadata,
          },
        }
      },
    }
  }

  return {}
}
