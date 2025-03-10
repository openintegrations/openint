import {z} from 'zod'
import type {ConnectorSchemas, ConnectorServer} from '@openint/cdk'
import {extractId, makeId} from '@openint/cdk'
import {makeUlid} from '@openint/util'
// TODO: Fix me as this is technically a cyclical dep
import {getServerUrl} from '../../../../apps/app-config/constants'
import type {JsonConnectorDef} from '../../def'
import {
  AuthorizeHandler,
  ExchangeTokenHandler,
  OAuth2ServerOverrides,
  RefreshTokenHandler,
  zOAuthConnectorDef,
  zTokenResponse,
} from './def'

// Helper function to make token requests
async function makeTokenRequest(
  url: string,
  params: Record<string, string>,
  flowType: 'exchange' | 'refresh',
  // note: we may want to add bodyFormat: form or json
): Promise<z.infer<typeof zTokenResponse>> {
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

  try {
    return zTokenResponse.parse(await response.json())
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(
        `Invalid oauth2 ${flowType} token response format: ${error.message}`,
      )
    }
    throw error
  }
}

const defaultAuthorizeHandler: AuthorizeHandler = async ({
  oauth_connector_def,
  redirect_uri,
  connection_id,
}) => {
  if (!connection_id) {
    throw new Error('No connection_id provided')
  }
  const url = new URL(oauth_connector_def.authorization_request_url)
  const params = mapOauthParams(
    {
      client_id: oauth_connector_def.connector_config.client_id,
      client_secret: oauth_connector_def.connector_config.client_secret,
      redirect_uri,
      scope: oauth_connector_def.connector_config.scopes?.join(
        oauth_connector_def.scope_separator,
      ),
      state: Buffer.from(connection_id).toString('base64'),
      ...(oauth_connector_def.params_config.authorize ?? {}),
    },
    oauth_connector_def.params_config.param_names ?? {},
  )

  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, value as string)
  })

  return {authorization_url: url.toString()}
}

const defaultTokenExchangeHandler: ExchangeTokenHandler = async ({
  oauth_connector_def,
  redirect_uri,
  code,
  state,
}) => {
  const url = new URL(oauth_connector_def.token_request_url)
  const params = mapOauthParams(
    {
      client_id: oauth_connector_def.connector_config.client_id,
      client_secret: oauth_connector_def.connector_config.client_secret,
      redirect_uri,
      scope: oauth_connector_def.connector_config.scopes?.join(
        oauth_connector_def.connector_config.scope_delimiter,
      ),
      state,
      grant_type: 'authorization_code',
      code,
      ...(oauth_connector_def.params_config.token ?? {}),
    },
    oauth_connector_def.params_config.param_names ?? {},
  )

  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, value as string)
  })

  return makeTokenRequest(
    oauth_connector_def.token_request_url,
    params,
    'exchange',
  )
}

const defaultTokenRefreshHandler: RefreshTokenHandler = async ({
  oauth_connector_def,
  refresh_token,
}) => {
  const params = mapOauthParams(
    {
      client_id: oauth_connector_def.connector_config.client_id,
      client_secret: oauth_connector_def.connector_config.client_secret,
      refresh_token,
      grant_type: 'refresh_token',
      ...(oauth_connector_def.params_config.token ?? {}),
    },
    oauth_connector_def.params_config.param_names ?? {},
  )

  return makeTokenRequest(
    oauth_connector_def.token_request_url,
    params,
    'refresh',
  )
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

/*
 * This function takes the paramNames map where a user can map were fields like client_id and client_secret are named in particular oauth connector.
 * For example salesforce may call client_id clientKey. In this case, the paramNames would have client_id: clientKey.
 * Following the SF example, this function will return a new object with the client_id field renamed to clientKey.
 * Write tests for this function to in different scenarios ensure that the clientKey is returned with the value initially set for client_id
 */
export function mapOauthParams(
  params: Record<string, string>,
  paramNames: Record<string, string>,
) {
  const result: Record<string, string> = {}

  // Process each parameter in the input
  Object.entries(params).forEach(([key, value]) => {
    if (key && paramNames && key in paramNames && paramNames[key]) {
      result[paramNames[key]] = value
    } else {
      result[key] = value
    }
  })

  return result
}

/*
 * This function generates a server implementation for an OAuth2 connector.
 * It takes a connector definition and overrides for the server implementation.
 *
 * Inspired by https://github.com/lelylan/simple-oauth2/blob/master/API.md
 *
 */
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
        oauth_connector_def: {
          ...connectorDef.auth,
          connector_config: connectorConfig,
          connection_settings: connectionSettings,
        } as any as z.infer<typeof zOAuthConnectorDef>, // TODO: fix this
        redirect_uri: getServerUrl(null) + '/connect/callback',
        connection_id: connectionId,
        // this is currently returning T['_types']['connectInput']
        // which is defined as {authorization_url} in cnext/schema.ts
        // but TS doesn't seem to be picking it up so we're using any
      }) as any
    },

    async postConnect(connectOutput, connectorConfig, connectionSettings) {
      // Use overrides if provided, otherwise use defaults
      const tokenHandler = overrides?.exchange || defaultTokenExchangeHandler

      if (!tokenHandler) {
        throw new Error('No token handler defined')
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
      const result = await tokenHandler({
        oauth_connector_def: {
          ...connectorDef.auth,
          connector_config: connectorConfig,
          connection_settings: connectionSettings,
        } as any as z.infer<typeof zOAuthConnectorDef>, // TODO: fix this
        code: connectOutput.code,
        state: connectOutput.state,
        redirect_uri,
      })

      console.log(`Oauth2 Postconnect result`, result)

      return {
        // NOTE: is this the right thing to do here?
        connectionExternalId: extractId(connectOutput.connectionId)[2],
        settings: {
          oauth: {
            credentials: {
              ...result,
              client_id: clientId,
              connection_id: connectOutput.connectionId,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              last_fetched_at: new Date().toISOString(),
              provider_config_key: connectorConfig.id,
              metadata: null,
            },
          },
          metadata: {}, // QQ: do we need this?
        },
        // NOTE: this is currently returning T['_types']['connectionSettings']
        // which is defined as {authorization_url} in cnext/schema.ts
        // but TS doesn't seem to be picking it up so we're using any
      } as any
    },

    async refreshConnection(connectionSettings, connectorConfig) {
      // Use overrides if provided, otherwise use defaults
      const refreshTokenHandler =
        overrides?.refresh || defaultTokenRefreshHandler

      if (!refreshTokenHandler) {
        throw new Error('No refresh token handler defined')
      }

      if (!isOAuth2ConnectorDef(connectorDef.auth)) {
        return zOAuthConnectorDef.parse(connectorDef.auth)
      }

      const refreshToken = connectionSettings?.oauth?.credentials?.refresh_token
      if (!refreshToken) {
        throw new Error('No refresh token available for this connection')
      }

      console.log(`Oauth2 Refresh connection called`)

      const result = await refreshTokenHandler({
        oauth_connector_def: {
          ...connectorDef.auth,
          connector_config: connectorConfig,
          connection_settings: connectionSettings,
        } as any as z.infer<typeof zOAuthConnectorDef>, // TODO: fix this
        refresh_token: refreshToken,
      })

      return {
        oauth: {
          credentials: {
            ...result,
            client_id: clientId,
            connection_id: connectionSettings.oauth?.credentials?.connection_id,
            created_at: connectionSettings.oauth?.credentials?.created_at,
            updated_at: new Date().toISOString(),
            last_fetched_at: new Date().toISOString(),
            provider_config_key:
              connectionSettings.oauth?.credentials?.provider_config_key ||
              connectorConfig.id,
            metadata: connectionSettings.oauth?.credentials?.metadata || null,
          },
        },
        metadata: {}, // QQ: do we need this?
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
