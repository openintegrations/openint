import type {ConnectorDef, ConnectorServer} from '@openint/cdk'
import {extractId, makeId} from '@openint/cdk'
import {getConnectorDefaultCredentials, getServerUrl} from '@openint/env'
import {makeUlid} from '@openint/util/id-utils'
import {type Z} from '@openint/util/zod-utils'
import type {oauth2Schemas, zOAuthConfig} from './def'
import {
  authorizeHandler,
  defaultTokenExchangeHandler,
  tokenRefreshHandler,
  validateOAuthCredentials,
} from './handlers'
import {fillOutStringTemplateVariablesInObjectKeys} from './utils'

function injectCcfgDefaultCredentials(
  connectorConfig: Z.infer<typeof oauth2Schemas.connector_config>,
  connectorName: string,
  oauthConfig: Z.infer<typeof zOAuthConfig>,
): Z.infer<typeof oauth2Schemas.connector_config> {
  const defaultCredentials = getConnectorDefaultCredentials(connectorName)
  if (
    !connectorConfig.oauth?.client_id &&
    !connectorConfig.oauth?.client_secret &&
    defaultCredentials?.['client_id'] &&
    defaultCredentials?.['client_secret']
  ) {
    const configuredScopes = connectorConfig.oauth?.scopes ?? []

    if (
      oauthConfig.openint_scopes &&
      configuredScopes.length > 0 &&
      !configuredScopes.every((scope) =>
        oauthConfig.openint_scopes?.includes(scope),
      )
    ) {
      const invalidScopes = configuredScopes.filter(
        (scope) => !oauthConfig.openint_scopes?.includes(scope),
      )
      throw new Error(
        `Invalid scopes configured: ${invalidScopes.join(', ')}. ` +
          `Valid default scopes are: ${oauthConfig.openint_scopes?.join(', ')}`,
      )
    }

    return {
      ...connectorConfig,
      oauth: {
        client_id: defaultCredentials?.['client_id'],
        client_secret: defaultCredentials?.['client_secret'],
        scopes: configuredScopes ?? [],
      },
    }
  }
  return connectorConfig
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
  T extends typeof oauth2Schemas & {name: Z.ZodLiteral<TName>},
  D extends ConnectorDef<T>,
>(
  connectorDef: D,
  oauthConfig: Z.infer<typeof zOAuthConfig>,
  overrides?: Partial<ConnectorServer<T>>,
): ConnectorServer<T> {
  if (
    // TODO: connectorDef.auth.type !== 'OAUTH2CC'?
    connectorDef.metadata?.authType !== 'OAUTH2'
  ) {
    throw new Error('This server can only be used with OAuth2 connectors')
  }

  // Create the base server implementation
  const baseServer: ConnectorServer<T> = {
    newInstance: ({config}) => {
      // Use the same helper function to get credentials
      const credentials = injectCcfgDefaultCredentials(
        config,
        connectorDef.name,
        oauthConfig,
      )
      // reusing validation logic from handlers.ts
      validateOAuthCredentials({connector_config: credentials} as any)
    },

    async preConnect(connectorConfig, connectionSettings, input) {
      const connectionId =
        input.connectionId ?? makeId('conn', connectorDef.name, makeUlid())

      console.log(
        `Oauth2 Preconnect called with for connectionId ${connectionId} and connectionSettings ${!!connectionSettings}`,
      )

      // console.warn(
      //   `Oauth2 Preconnect called with oauthConfig ${JSON.stringify(
      //     oauthConfig,
      //   )} and connectorConfig ${JSON.stringify(
      //     connectorConfig,
      //   )} and connectionSettings ${JSON.stringify(connectionSettings)}`,
      // )

      const ccfg = injectCcfgDefaultCredentials(
        connectorConfig,
        connectorDef.name,
        oauthConfig,
      )
      return authorizeHandler({
        oauthConfig: {
          ...fillOutStringTemplateVariablesInObjectKeys(
            oauthConfig,
            connectorConfig.oauth,
            // @ts-expect-error: QQ: fix this
            connectionSettings.oauth,
          ),
          connector_config: ccfg,
        },
        redirectUri: getServerUrl(null) + '/connect/callback',
        connectionId: connectionId,
        //  QQ: fix issue with Type '{ authorization_url: string; }' is not assignable to type 'T["_types"]["connectInput"]
      }) as any
    },

    async postConnect(connectOutput, connectorConfig, ctx) {
      const connectionId = connectOutput.state
      console.log(`Oauth2 Postconnect called for connectionId ${connectionId}`)
      const ccfg = injectCcfgDefaultCredentials(
        connectorConfig,
        connectorDef.name,
        oauthConfig,
      )
      const result = await defaultTokenExchangeHandler({
        oauthConfig: {
          ...fillOutStringTemplateVariablesInObjectKeys(
            oauthConfig,
            ccfg.oauth,
            // @ts-expect-error: QQ: fix this
            ctx.oauth,
          ),
          connector_config: ccfg,
        } satisfies Z.infer<typeof zOAuthConfig>,
        code: connectOutput.code,
        state: connectOutput.state,
        redirectUri: getServerUrl(null) + '/connect/callback',
        fetch: ctx.fetch,
      })
      console.log('token exchange result', result)

      return {
        // QQ: is this the right thing to do here?
        connectionExternalId: connectionId
          ? extractId(connectionId as any)[2]
          : undefined,
        settings: {
          oauth: {
            credentials: {
              ...result,
              client_id: ccfg.oauth?.client_id,
            },
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            last_fetched_at: new Date().toISOString(),
            metadata: null,
          },
          metadata: {},
        },
        // NOTE: this is currently returning T['_types']['connectionSettings']
        // which is defined as {authorization_url} in cnext/schema.ts
        // but TS doesn't seem to be picking it up so we're using any
      } as any // TODO: QQ review
    },

    async refreshConnection(connectionSettings, connectorConfig) {
      const refreshToken = connectionSettings?.oauth?.credentials?.refresh_token
      if (!refreshToken) {
        throw new Error('No refresh token available for this connection')
      }

      console.log(`Oauth2 Refresh connection called`)
      const ccfg = injectCcfgDefaultCredentials(
        connectorConfig,
        connectorDef.name,
        oauthConfig,
      )

      const result = await tokenRefreshHandler({
        oauthConfig: {
          ...fillOutStringTemplateVariablesInObjectKeys(
            oauthConfig,
            ccfg.oauth,
            connectionSettings.oauth,
          ),
          connector_config: ccfg,
          connection_settings: connectionSettings,
        } as any as Z.infer<typeof zOAuthConfig>, // TODO: fix this
        refreshToken: refreshToken,
      })

      return {
        oauth: {
          credentials: {
            ...result,
            client_id: ccfg.oauth?.client_id,
          },
          created_at: connectionSettings.oauth?.created_at,
          updated_at: new Date().toISOString(),
          last_fetched_at: new Date().toISOString(),
          metadata: connectionSettings.oauth?.metadata || null,
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

      const {expires_at: expiresAt, refresh_token: refreshToken} =
        settings.oauth.credentials

      const isTokenExpired = expiresAt && new Date(expiresAt) < new Date()
      const shouldRefreshToken = isTokenExpired || refreshToken

      if (shouldRefreshToken) {
        if (!refreshToken || !this.refreshConnection) {
          throw new Error('Token expired and no refresh token available')
        }

        try {
          // Attempt to refresh the token
          return this.refreshConnection(settings, config)
        } catch (error: any) {
          throw new Error(`Failed to refresh token: ${error.message}`)
        }
      }

      // NOTE:
      // 1) in the future we could have connector def set up a test connection url, such as /user/info
      // and then we could use that to validate the connection
      // for now we're just going to check if the token is expired and try to refresh it
      // 2) We could also support the token introspection endpoint https://www.oauth.com/oauth2-servers/token-introspection-endpoint/

      return settings
    },
  }

  // Apply any server method overrides
  return {
    ...baseServer,
    ...overrides,
  } as ConnectorServer<T>
}
