import {z} from 'zod'
import type {ConnectorDef, ConnectorServer} from '@openint/cdk'
import {extractId, makeId} from '@openint/cdk'
import {getConnectorDefaultCredentials, getServerUrl} from '@openint/env'
import {makeUlid} from '@openint/util'
import {oauth2Schemas, zOAuthConfig} from './def'
import {
  authorizeHandler,
  defaultTokenExchangeHandler,
  tokenRefreshHandler,
} from './handlers'
import {fillOutStringTemplateVariablesInObjectKeys} from './utils'

function injectCcfgDefaultCredentials(
  config: any,
  connectorName: string,
): {
  client_id: string
  client_secret: string
  scopes?: string[] | null | undefined
} {
  const defaultCredentials = getConnectorDefaultCredentials(connectorName)
  return {
    ...config,
    client_id: config['client_id'] ?? defaultCredentials?.['client_id'],
    client_secret:
      config['client_secret'] ?? defaultCredentials?.['client_secret'],
    scopes: config.scopes,
  }
}

/*
 * This function generates a server implementation for an OAuth2 connector.
 * It takes a connector definition and overrides for the server implementation.
 *
 * Inspired by https://github.com/lelylan/simple-oauth2/blob/master/API.md
 *
 */
export function generateOAuth2Server<
  TName extends string,
  T extends typeof oauth2Schemas & {name: z.ZodLiteral<TName>},
  D extends ConnectorDef<T>,
>(
  connectorDef: D,
  oauthConfig: z.infer<typeof zOAuthConfig>,
  overrides?: Partial<ConnectorServer<T>>,
): ConnectorServer<T> {
  // Only use this for OAuth2 connectors
  if (
    // TODO: connectorDef.auth.type !== 'OAUTH2CC'?
    connectorDef.metadata?.authType !== 'OAUTH2'
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
      const credentials = injectCcfgDefaultCredentials(config, connectorName)
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
      const connectionId =
        input.connectionId ?? makeId('conn', connectorDef.name, makeUlid())

      console.log(
        `Oauth2 Preconnect called with connectionSettings ${!!connectionSettings}`,
      )

      return authorizeHandler({
        oauthConfig: {
          ...fillOutStringTemplateVariablesInObjectKeys(
            oauthConfig,
            connectorConfig,
            connectionSettings,
          ),
          connector_config: connectorConfig,
        },
        redirectUri: getServerUrl(null) + '/connect/callback',
        connectionId: connectionId,
        //  QQ: fix issue with Type '{ authorization_url: string; }' is not assignable to type 'T["_types"]["connectInput"]
      }) as any
    },

    async postConnect(connectOutput, connectorConfig, connectionSettings) {
      const redirect_uri = getServerUrl(null) + '/connect/callback'
      console.log(`Oauth2 Postconnect called`)
      const result = await defaultTokenExchangeHandler({
        oauth_config: {
          ...fillOutStringTemplateVariablesInObjectKeys(
            oauthConfig,
            connectorConfig,
            connectionSettings,
          ),
          connector_config: connectorConfig,
        } satisfies z.infer<typeof zOAuthConfig>,
        code: connectOutput.code,
        state: connectOutput.state,
        redirect_uri,
      })

      console.log(`Oauth2 Postconnect completed`)

      return {
        // QQ: is this the right thing to do here?
        connectionExternalId: connectOutput.connectionId
          ? extractId(connectOutput.connectionId)[2]
          : undefined,
        settings: {
          oauth: {
            credentials: {
              ...result,
              client_id: clientId,
              connection_id: connectOutput.connectionId,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              last_fetched_at: new Date().toISOString(),

              // QQ: What to do for these?
              provider_config_key: undefined,
              metadata: null,
            },
          },
          metadata: {},
        },
        // NOTE: this is currently returning T['_types']['connectionSettings']
        // which is defined as {authorization_url} in cnext/schema.ts
        // but TS doesn't seem to be picking it up so we're using any
      } as any // TODO: review
    },

    async refreshConnection(connectionSettings, connectorConfig) {
      const refreshToken = connectionSettings?.oauth?.credentials?.refresh_token
      if (!refreshToken) {
        throw new Error('No refresh token available for this connection')
      }

      console.log(`Oauth2 Refresh connection called`)

      const result = await tokenRefreshHandler({
        oauth_config: {
          ...fillOutStringTemplateVariablesInObjectKeys(
            oauthConfig,
            connectorConfig,
            connectionSettings,
          ),
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
            // QQ: What to do for these?
            provider_config_key:
              connectionSettings.oauth?.credentials?.provider_config_key,
            metadata: connectionSettings.oauth?.credentials?.metadata || null,
          },
        },
        metadata: {}, // QQ: do we need this?
      } as any
    },

    // @ts-expect-error: QQ
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
          const newSettings = await this.refreshConnection(settings, config)
          return {
            connectionExternalId: settings.oauth?.credentials?.connection_id,
            settings: newSettings,
            config,
          }
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
