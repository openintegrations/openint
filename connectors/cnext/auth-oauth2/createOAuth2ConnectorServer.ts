import type {ConnectorDef, ConnectorServer, Id} from '@openint/cdk'
import type {Z} from '@openint/util/zod-utils'
import type {oauth2Schemas, zOAuthConfig} from './schemas'

import {extractId, makeId} from '@openint/cdk'
import {env, resolveRoute} from '@openint/env'
import {createCodeVerifier} from '@openint/oauth2/utils.client'
import {makeUlid} from '@openint/util/id-utils'
import {zOauthState} from './schemas'
import {getClient, getRequestedScopes} from './utils'

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
): ConnectorServer<T, ReturnType<typeof getClient>> {
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
        scopes: getRequestedScopes(config, oauthConfig),
        state: JSON.stringify({
          connection_id: connectionId,
          redirect_uri: new URL(
            ...resolveRoute('/connect/callback', null),
          ).toString(),
        }),
        code_challenge: codeChallenge,
        additional_params: oauthConfig.params_config.authorize,
      })

      // console.log(oauthConfig.params_config.authorize)
      // console.log('authorizeUrl', authorizeUrl)

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

      const tokenRes = await client.exchangeCodeForToken({
        code: connectOutput.code,
        redirect_uri:
          config.oauth?.redirect_uri?.trim() ||
          env.NEXT_PUBLIC_OAUTH_REDIRECT_URI_GATEWAY,
        code_verifier: connectOutput.code_verifier,
        additional_params: oauthConfig.params_config.token,
      })
      // TODO: Handle error properly...
      // .catch((err) => {
      //   // Got to handle the 400 errors
      //   if (err instanceof OAuth2Error) {
      //     if (err.request.status < 500) {
      //       throw new TRPCError({
      //         code: 'BAD_REQUEST',
      //         message: err.message,
      //       })
      //     }
      //   }
      //   throw err
      // })
      // console.log('[oauth2] postConnect res', res, config)

      const introspectRes = oauthConfig.introspection_request_url
        ? await client.introspectToken({
            token: tokenRes.access_token,
            additional_params: oauthConfig.params_config.introspect,
          })
        : undefined

      return {
        // TODO: Fix this connectionExternalId abstraction
        connectionExternalId: extractId(state.connection_id as Id['conn'])[2],
        settings: {
          introspection_result: introspectRes,
          oauth: {
            credentials: {
              client_id: client.config.clientId,
              access_token: tokenRes.access_token,
              // NOTE: in case of a pre-existing connection, the previous refresh token may get lost?
              refresh_token: tokenRes.refresh_token,
              expires_in: tokenRes.expires_in,
              expires_at: tokenRes.expires_in
                ? new Date(
                    Date.now() + tokenRes.expires_in * 1000,
                  ).toISOString()
                : undefined,
              scope:
                tokenRes.scope ?? client.joinScopes(config.oauth?.scopes ?? []),
              raw: tokenRes,
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

      // If the expires_at is not set, set it to the current time plus the expires_in
      // expires_at is a calculated field that we rely in to check if connection is expired throughout the codebase,
      // and its not part of the oauth protocol, hence its important to enforce it creation time
      if (
        settings?.oauth?.credentials?.expires_in &&
        !settings?.oauth?.credentials?.expires_at
      ) {
        settings.oauth.credentials.expires_at = new Date(
          Date.now() + settings.oauth.credentials.expires_in * 1000,
        ).toISOString()
      }
      // console.log('[oauth2] Check connection called', oauthConfig)

      const {refresh_token: refreshToken, expires_at: expiresAt} =
        settings.oauth.credentials

      // NOTE: Currently introspection is not called unless the access token is NOT expired AND refresh token does not exist,
      // !refreshToken & access_token & isExpired & introspectUrlExists this will ALWAYS throw an error instead of just trying the introspection URL, which I'm not sure if accurate.

      if (refreshToken && oauthConfig.token_request_url) {
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
                refresh_token: res.refresh_token ?? refreshToken,
                expires_in: res.expires_in,
                expires_at: res.expires_in
                  ? new Date(Date.now() + res.expires_in * 1000).toISOString()
                  : undefined,
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
          return {
            settings,
            status: 'error',
            status_message: `Token refresh failed with error ${
              error instanceof Error ? error.message : 'Unknown error'
            }`,
          }
        }
      }

      if (oauthConfig.introspection_request_url) {
        try {
          const res = await client.introspectToken({
            token: settings.oauth.credentials.access_token,
            additional_params: oauthConfig.params_config.introspect,
          })
          if (res.active) {
            return {settings, status: 'healthy', status_message: null}
          } else {
            console.error('[oauth2] Token introspection failed', res)
            // Should this be revoked?
            return {settings, status: 'disconnected', status_message: null}
          }
        } catch (error: unknown) {
          return {
            settings,
            status: 'error',
            status_message: `Token introspection failed with error ${error instanceof Error ? error.message : 'Unknown error'}`,
          }
        }
      }
      const tokenIsExpired = expiresAt && new Date(expiresAt) < new Date()
      if (tokenIsExpired) {
        return {
          settings,
          status: 'disconnected',
          status_message: `Token expired at ${expiresAt}`,
        }
      }

      // NOTE:
      // 1) in the future we could also have connector def set up a test connection url, such as /user/info
      // and then we could use that to validate the connection
      // for now we're just going to check if the token is expired and try to refresh it

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
