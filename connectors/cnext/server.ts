import {z} from 'zod'
import {ConnectorSchemas, ConnectorServer} from '../../kits/cdk'
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
}) => {
  const url = new URL(authorization_request_url)

  // Add connector_config parameters
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
  // QQ? generate state parameter to prevent csrf attacks?
  // TODO: Where to store it to be able to access it later if the connection does not exist?
  const state = crypto.randomUUID()
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
  console.log('RECEIVED OAUTH RESPONSE: ', response)
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
      async preConnect(connectorConfig, connectionSettings) {
        console.warn(
          `Skipping reading connection settings in preconnect with n keys ${
            Object.keys(connectionSettings).length
          }`,
        )
        const authorizeHandler =
          connectorDef.handlers?.authorize ?? defaultAuthorizeHandler

        if (!authorizeHandler) {
          throw new Error('No authorize handler defined')
        }

        return authorizeHandler({
          authorization_request_url: connectorDef.authorization_request_url,
          auth_params: connectorDef.auth_params,
          connector_config: connectorConfig,
          redirect_uri: 'http://localhost:4000/connect/callbacknew', // TODO: should this be default or dynamic from context.redirect_uri
        })
      },
      // @ts-expect-error, QQ not sure why
      async postConnect(connectOutput, config, context) {
        const tokenHandler = connectorDef.handlers?.token || defaultTokenHandler

        if (!tokenHandler) {
          throw new Error('No token handler defined')
        }

        // TODO: should this be default or dynamic from context.redirect_uri
        console.log(
          `SKIPPING USE OF CONTEXT IN OAUTH POSTCONNECT has ${Object.keys(
            context,
          )}`,
        )
        const redirect_uri = 'http://localhost:4000/connect/callbacknew'

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

        return {
          connectionExternalId: connectOutput.connectionId,
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
                provider_config_key: 'oauth', // Default value, should probably come from config
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
