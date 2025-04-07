import type {ConnectorDef, ConnectorServer, ExternalId} from '@openint/cdk'
import {makeId} from '@openint/cdk'
import {getServerUrl} from '@openint/env'
import {createCodeVerifier} from '@openint/oauth2/utils.client'
import {makeUlid} from '@openint/util/id-utils'
import {type Z} from '@openint/util/zod-utils'
import type {oauth2Schemas, zOAuthConfig} from './schemas'
import {getClient} from './utils'

/*
 * This function generates a server implementation for an OAuth2 connector.
 * It takes a connector definition and overrides for the server implementation.
 *
 * Inspired by https://github.com/lelylan/simple-oauth2/blob/master/API.md
 *
 */
export function createOAuth2ConnectorServer<
  TName extends string,
  T extends typeof oauth2Schemas & {name: Z.ZodLiteral<TName>},
>(
  connectorDef: ConnectorDef<T>,
  oauthConfigTemplate: Z.infer<typeof zOAuthConfig>,
) {
  if (
    // TODO: connectorDef.auth.type !== 'OAUTH2CC'?
    connectorDef.metadata?.authType !== 'OAUTH2'
  ) {
    throw new Error('This server can only be used with OAuth2 connectors')
  }

  // Create the base server implementation
  const baseServer = {
    newInstance: ({config, settings}) =>
      getClient({
        connectorName: connectorDef.name,
        oauthConfigTemplate,
        connectorConfig: config,
        connectionSettings: settings,
        fetch: undefined,
        baseURLs: {api: '', console: '', connect: ''},
      }),

    async preConnect({config, context, input}) {
      const connectionId =
        input.connection_id ?? makeId('conn', connectorDef.name, makeUlid())

      console.log(
        `Oauth2 Preconnect called with for connectionId ${connectionId} and connectionSettings ${!!context.connection}`,
      )
      const {client, oauthConfig} = getClient({
        connectorName: connectorDef.name,
        oauthConfigTemplate,
        connectorConfig: config,
        connectionSettings: undefined,
        fetch: context.fetch,
        baseURLs: context.baseURLs,
      })

      const codeChallenge = oauthConfig.code_challenge_method
        ? {
            verifier: createCodeVerifier(),
            method: oauthConfig.code_challenge_method,
          }
        : undefined

      const authorizeUrl = await client.getAuthorizeUrl({
        redirect_uri: getServerUrl(null) + '/connect/callback',
        scopes: config.oauth?.scopes ?? [],
        state: connectionId,
        code_challenge: codeChallenge,
        ...oauthConfig.params_config.authorize,
      })

      return {
        authorization_url: authorizeUrl,
        code_verifier: codeChallenge?.verifier,
      }
    },

    async postConnect({connectOutput, config, context}) {
      const connectionId = connectOutput.state
      console.log(`Oauth2 Postconnect called for connectionId ${connectionId}`)
      const {client, oauthConfig} = getClient({
        connectorName: connectorDef.name,
        oauthConfigTemplate,
        connectorConfig: config,
        connectionSettings: undefined,
        fetch: context.fetch,
        baseURLs: context.baseURLs,
      })
      // console.log(`oauthConfig`, oauthConfig)

      const res = await client.exchangeCodeForToken({
        code: connectOutput.code,
        redirectUri: getServerUrl(null) + '/connect/callback',
        code_verifier: connectOutput.code_verifier,
        additional_params: oauthConfig.params_config.token,
      })

      return {
        connectionExternalId: undefined as unknown as ExternalId,
        settings: {
          oauth: {
            credentials: {
              client_id: client.config.clientId,
              access_token: res.access_token,
              refresh_token: res.refresh_token,
              expires_in: res.expires_in,
              scope: res.scope ?? client.joinScopes(config.oauth?.scopes ?? []),
              raw: res,
              token_type: undefined, // What should this be?
            },
          },
        },
        integration: undefined, // TODO: add integration
      }
    },

    async refreshConnection({settings, config}) {
      const refreshToken = settings?.oauth?.credentials?.refresh_token
      if (!refreshToken) {
        throw new Error('No refresh token available for this connection')
      }

      console.log(`Oauth2 Refresh connection called`)
      const {client, oauthConfig} = getClient({
        connectorName: connectorDef.name,
        oauthConfigTemplate,
        connectorConfig: config,
        connectionSettings: settings,
        fetch: undefined, // FIX: Always pass context
        baseURLs: {api: '', console: '', connect: ''},
      })
      const res = await client.refreshToken({
        refresh_token: refreshToken,
        additional_params: oauthConfig.params_config.refresh,
      })

      return {
        oauth: {
          credentials: {
            client_id: client.config.clientId,
            access_token: res.access_token,
            refresh_token: res.refresh_token,
            expires_in: res.expires_in,
            raw: res,
            scope: res.scope ?? client.joinScopes(config.oauth?.scopes ?? []),
            token_type: undefined, // What should this be?
          },
        },
      } satisfies Z.infer<typeof oauth2Schemas.connection_settings>
    },

    async checkConnection({settings, config}) {
      // If there's no access token, throw an error
      if (!settings?.oauth?.credentials?.access_token) {
        throw new Error('No access token available')
      }

      const {client, oauthConfig} = getClient({
        connectorName: connectorDef.name,
        oauthConfigTemplate,
        connectorConfig: config,
        connectionSettings: settings,
        fetch: undefined, // FIX: Always pass consistent context with fetch inside
        baseURLs: {api: '', console: '', connect: ''},
      })

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
          return {settings: await this.refreshConnection({settings, config})}
        } catch (error: unknown) {
          throw new Error(`Failed to refresh token: ${error}`)
        }
      } else if (oauthConfig.introspection_request_url) {
        const res = await client.introspectToken({
          token: settings.oauth.credentials.access_token,
          additional_params: oauthConfig.params_config.introspect,
        })
        if (res.active) {
          return {settings}
        } else {
          throw new Error('Token is not active')
        }
      }
      // TODO: Return proper `status` for connection

      // NOTE:
      // 1) in the future we could have connector def set up a test connection url, such as /user/info
      // and then we could use that to validate the connection
      // for now we're just going to check if the token is expired and try to refresh it
      // 2) We could also support the token introspection endpoint https://www.oauth.com/oauth2-servers/token-introspection-endpoint/

      return {settings}
    },
    revokeConnection: async ({settings, config}) => {
      const {client, oauthConfig} = getClient({
        connectorName: connectorDef.name,
        oauthConfigTemplate,
        connectorConfig: config,
        connectionSettings: settings,
        fetch: undefined, // FIX: Always pass consistent context with fetch inside
        baseURLs: {api: '', console: '', connect: ''},
      })
      if (!settings.oauth.credentials?.access_token) {
        throw new Error('No access token available')
      }
      if (!oauthConfig.revocation_request_url) {
        throw new Error('No revocation request url available')
      }
      await client.revokeToken({
        token: settings.oauth.credentials.access_token,
        additional_params: oauthConfig.params_config.revoke,
      })
    },
  } satisfies ConnectorServer<typeof oauth2Schemas & {name: T['name']}>

  return baseServer as unknown as ConnectorServer<ConnectorDef<T>['schemas']>
}
