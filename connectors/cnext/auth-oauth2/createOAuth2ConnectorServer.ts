import type {ConnectorDef, ConnectorServer, Id} from '@openint/cdk'
import type {Z} from '@openint/util/zod-utils'
import type {oauth2Schemas, zOAuthConfig} from './schemas'

import {extractId, makeId} from '@openint/cdk'
import {env, getBaseURLs} from '@openint/env'
import {createCodeVerifier} from '@openint/oauth2/utils.client'
import {makeUlid} from '@openint/util/id-utils'
import {zOauthState} from './schemas'
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
    newInstance: ({config, settings, context}) =>
      getClient({
        connectorName: connectorDef.name,
        oauthConfigTemplate,
        connectorConfig: config,
        connectionSettings: settings,
        fetch: context.fetch,
        baseURLs: context.baseURLs,
      }),

    async preConnect({
      config,
      input,
      instance: {client, oauthConfig},
      context,
    }) {
      const connectionId =
        input.connection_id ??
        makeId(
          'conn',
          connectorDef.name,
          context.connectionExternalId ?? makeUlid(),
        )

      // console.log(
      //   `Oauth2 Preconnect called with for connectionId ${connectionId} and connectionSettings ${!!context.connection}`,
      //   config,
      // )

      const codeChallenge = oauthConfig.code_challenge_method
        ? {
            verifier: createCodeVerifier(),
            method: oauthConfig.code_challenge_method,
          }
        : undefined

      const authorizeUrl = await client.getAuthorizeUrl({
        redirect_uri:
          config.oauth?.redirect_uri?.trim() ||
          env.NEXT_PUBLIC_OAUTH_REDIRECT_URI_GATEWAY,
        scopes: config.oauth?.scopes
          ? // here because some old ccfgs have scopes as a string
            typeof config.oauth.scopes === 'string'
            ? (config.oauth.scopes as string).split(
                oauthConfigTemplate.scope_separator ?? ' ',
              )
            : config.oauth.scopes
          : [],
        state: JSON.stringify({
          connection_id: connectionId,
          redirect_uri: getBaseURLs(null).connect + '/callback',
        }),
        code_challenge: codeChallenge,
        ...oauthConfig.params_config.authorize,
      })

      return {
        authorization_url: authorizeUrl,
        code_verifier: codeChallenge?.verifier,
      }
    },

    async postConnect({
      connectOutput,
      config,
      instance: {client, oauthConfig},
    }) {
      const state = zOauthState.parse(JSON.parse(connectOutput.state))

      // console.log(
      //   `Oauth2 Postconnect called for connectionId ${state.connection_id}`,
      // )

      const res = await client.exchangeCodeForToken({
        code: connectOutput.code,
        redirect_uri:
          config.oauth?.redirect_uri?.trim() ||
          env.NEXT_PUBLIC_OAUTH_REDIRECT_URI_GATEWAY,
        code_verifier: connectOutput.code_verifier,
        additional_params: oauthConfig.params_config.token,
      })

      return {
        // TODO: Fix this connectionExternalId abstraction
        connectionExternalId: extractId(state.connection_id as Id['conn'])[2],
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
        status: 'healthy',
        status_message: null,
      }
    },

    async checkConnection({settings, config, instance}) {
      const {client, oauthConfig} = instance
      // If there's no access token, throw an error
      if (!settings?.oauth?.credentials?.access_token) {
        throw new Error('No access token available')
      }

      // console.log('[oauth2] Check connection called', oauthConfig)

      const {expires_at: expiresAt, refresh_token: refreshToken} =
        settings.oauth.credentials

      const isTokenExpired = expiresAt && new Date(expiresAt) < new Date()
      const shouldRefreshToken = isTokenExpired || refreshToken

      if (shouldRefreshToken) {
        if (!refreshToken) {
          throw new Error('Token expired and no refresh token available')
        }
        try {
          const res = await client.refreshToken({
            refresh_token: refreshToken,
            additional_params: oauthConfig.params_config.refresh,
          })
          const settings = {
            oauth: {
              credentials: {
                client_id: client.config.clientId,
                access_token: res.access_token,
                refresh_token: res.refresh_token,
                expires_in: res.expires_in,
                raw: res,
                scope:
                  res.scope ?? client.joinScopes(config.oauth?.scopes ?? []),
                token_type: undefined, // What should this be?
              },
            },
          } satisfies Z.infer<typeof oauth2Schemas.connection_settings>
          // Attempt to refresh the token
          return {settings, status: 'healthy', status_message: null}
        } catch (error: unknown) {
          throw new Error(`Failed to refresh token: ${error}`)
        }
      } else if (oauthConfig.introspection_request_url) {
        const res = await client.introspectToken({
          token: settings.oauth.credentials.access_token,
          additional_params: oauthConfig.params_config.introspect,
        })
        if (res.active) {
          return {settings, status: 'healthy', status_message: null}
        } else {
          console.log('[oauth2] Token introspection failed', res)
          // Should this be revoked?
          return {settings, status: 'disconnected', status_message: null}
        }
      }
      // TODO: Return proper `status` for connection

      // NOTE:
      // 1) in the future we could have connector def set up a test connection url, such as /user/info
      // and then we could use that to validate the connection
      // for now we're just going to check if the token is expired and try to refresh it
      // 2) We could also support the token introspection endpoint https://www.oauth.com/oauth2-servers/token-introspection-endpoint/

      return {settings, status: 'healthy', status_message: null}
    },

    revokeConnection: async ({settings, instance: {client, oauthConfig}}) => {
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
  } satisfies ConnectorServer<
    typeof oauth2Schemas & {name: T['name']},
    ReturnType<typeof getClient>
  >

  return baseServer as unknown as ConnectorServer<
    ConnectorDef<T>['schemas'],
    ReturnType<typeof getClient>
  >
}
