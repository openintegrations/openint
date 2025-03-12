import {z} from 'zod'
import type {
  ConnectorDef,
  ConnectorSchemas,
  ConnectorServer,
} from '@openint/cdk'
import {extractId, makeId} from '@openint/cdk'
import {makeUlid} from '@openint/util'
// TODO: Fix me as this is technically a cyclical dep
import {getServerUrl} from '../../../../apps/app-config/constants'
import {
  AuthorizeHandler,
  ExchangeTokenHandler,
  OAuth2ServerOverrides,
  RefreshTokenHandler,
  zOAuthConfig,
} from './def'
import {
  fillOutStringTemplateVariables,
  makeTokenRequest,
  prepareScopes,
} from './utils'

const defaultAuthorizeHandler: AuthorizeHandler = async ({
  oauth_config,
  redirect_uri,
  connection_id,
}) => {
  if (!connection_id) {
    throw new Error('No connection_id provided')
  }
  const url = new URL(
    fillOutStringTemplateVariables(
      oauth_config.authorization_request_url,
      oauth_config.connector_config,
      oauth_config.connection_settings,
    ),
  )
  const params = mapOauthParams(
    {
      client_id: oauth_config.connector_config.client_id,
      client_secret: oauth_config.connector_config.client_secret,
      redirect_uri,
      response_type: 'code',
      // decoding it as url.toString() encodes it alredy
      scope: decodeURIComponent(prepareScopes(oauth_config)),
      state: Buffer.from(connection_id).toString('base64'),
      ...(oauth_config.params_config.authorize ?? {}),
    },
    oauth_config.params_config.param_names ?? {},
  )

  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, value as string)
  })

  // putting it as %20 for spaces instead of the default encoding of url.toString() which is +
  return {authorization_url: url.toString().replace(/\+/g, '%20')}
}

const defaultTokenExchangeHandler: ExchangeTokenHandler = async ({
  oauth_config,
  redirect_uri,
  code,
  state,
}) => {
  // TODO (@pellicceama): For every value in params apply template literal substitution
  const params = mapOauthParams(
    {
      client_id: oauth_config.connector_config.client_id,
      client_secret: oauth_config.connector_config.client_secret,
      redirect_uri,
      scope: prepareScopes(oauth_config),
      state,
      grant_type: 'authorization_code',
      code,
      ...(oauth_config.params_config.token ?? {}),
    },
    oauth_config.params_config.param_names ?? {},
  )

  const url = fillOutStringTemplateVariables(
    oauth_config.token_request_url,
    oauth_config.connector_config,
    oauth_config.connection_settings,
  )
  return makeTokenRequest(url, params, 'exchange')
}

const defaultTokenRefreshHandler: RefreshTokenHandler = async ({
  oauth_config,
  refresh_token,
}) => {
  const params = mapOauthParams(
    {
      client_id: oauth_config.connector_config.client_id,
      client_secret: oauth_config.connector_config.client_secret,
      refresh_token,
      grant_type: 'refresh_token',
      ...(oauth_config.params_config.token ?? {}),
    },
    oauth_config.params_config.param_names ?? {},
  )

  const url = fillOutStringTemplateVariables(
    oauth_config.token_request_url,
    oauth_config.connector_config,
    oauth_config.connection_settings,
  )
  return makeTokenRequest(url, params, 'refresh')
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
): auth is z.infer<typeof zOAuthConfig> {
  return zOAuthConfig.safeParse(auth).success
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
export function generateOAuth2Server<
  T extends ConnectorSchemas,
  D extends ConnectorDef<T>,
>(
  connectorDef: D,
  oauthConfig: z.infer<typeof zOAuthConfig>,
  overrides?: {
    server?: Partial<ConnectorServer<T>>
    oauth2?: Partial<OAuth2ServerOverrides>
  },
): ConnectorServer<T> {
  // Only use this for OAuth2 connectors
  if (
    // TODO: connectorDef.auth.type !== 'OAUTH2CC'?
    connectorDef.metadata?.authType !== 'OAUTH2' &&
    !isOAuth2ConnectorDef(oauthConfig)
  ) {
    throw new Error('This server can only be used with OAuth2 connectors')
  }

  const connectorName = connectorDef.name
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

      if (!isOAuth2ConnectorDef(oauthConfig)) {
        console.log(`Oauth2 Preconnect issue with oauthConfig`)
        return zOAuthConfig.parse(oauthConfig)
      }

      const connectionId =
        input.connectionId ?? makeId('conn', connectorDef.name, makeUlid())

      console.log(`Oauth2 Preconnect called`)

      return authorizeHandler({
        oauth_config: {
          ...oauthConfig,
          connector_config: connectorConfig,
        } satisfies z.infer<typeof zOAuthConfig>,
        redirect_uri: getServerUrl(null) + '/connect/callback',
        connection_id: connectionId,
        // this is currently returning T['_types']['connectInput']
        // which is defined as {authorization_url} in cnext/schema.ts
        // but TS doesn't seem to be picking it up so we're using any
      }) as any
    },

    async postConnect(connectOutput, connectorConfig) {
      // Use overrides if provided, otherwise use defaults
      const tokenHandler = overrides?.exchange || defaultTokenExchangeHandler

      if (!tokenHandler) {
        throw new Error('No token handler defined')
      }

      if (!isOAuth2ConnectorDef(oauthConfig)) {
        return zOAuthConfig.parse(oauthConfig)
      }

      const redirect_uri = getServerUrl(null) + '/connect/callback'
      // const redirect_uri =
      //   'https://f887-38-9-28-71.ngrok-free.app/connect/callback'
      console.log(`Oauth2 Postconnect called`)
      const result = await tokenHandler({
        oauth_config: {
          ...oauthConfig,
          connector_config: connectorConfig,
        } satisfies z.infer<typeof zOAuthConfig>,
        code: connectOutput.code,
        state: connectOutput.state,
        redirect_uri,
      })

      console.log(`Oauth2 Postconnect completed`)

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
      } as any // TODO: review
    },

    async refreshConnection(connectionSettings, connectorConfig) {
      // Use overrides if provided, otherwise use defaults
      const refreshTokenHandler =
        overrides?.refresh || defaultTokenRefreshHandler

      if (!refreshTokenHandler) {
        throw new Error('No refresh token handler defined')
      }

      if (!isOAuth2ConnectorDef(oauthConfig)) {
        return zOAuthConfig.parse(oauthConfig)
      }

      const refreshToken = connectionSettings?.oauth?.credentials?.refresh_token
      if (!refreshToken) {
        throw new Error('No refresh token available for this connection')
      }

      console.log(`Oauth2 Refresh connection called`)

      const result = await refreshTokenHandler({
        oauth_config: {
          ...oauthConfig,
          connector_config: connectorConfig,
          connection_settings: connectionSettings,
        } as any as z.infer<typeof zOAuthConfig>, // TODO: fix this
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

    // @ts-expect-error: review
    async checkConnection({settings, config}) {
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
      } // TODO: review
    },
  }

  // Apply any server method overrides
  return {
    ...baseServer,
    ...overrides,
  } as ConnectorServer<T>
}
