/* eslint-disable @typescript-eslint/require-await */
import type {
  OAuthAuthCode,
  OAuthAuthCodeRepository,
  OAuthClient,
  OAuthClientRepository,
  OAuthScope,
  OAuthScopeRepository,
  OAuthToken,
  OAuthTokenRepository,
  OAuthUser,
  OAuthUserRepository,
} from '@jmondi/oauth2-server'
import {AuthorizationServer} from '@jmondi/oauth2-server'
import {Elysia} from 'elysia'
import {requestFromVanilla, responseToVanilla} from './utils.server'

export function createOAuth2Server({
  clients,
  scopes,
  users,
  authCodes,
  serviceName = 'my-service',
}: {
  clients?: OAuthClient[]
  scopes?: OAuthScope[]
  users?: OAuthUser[]
  authCodes?: OAuthAuthCode[]
  serviceName?: string
}) {
  const clientRepository = createClientRepository(clients)
  const tokenRepository = createTokenRepository([])
  const scopeRepository = createScopeRepository(scopes)

  const authServer = new AuthorizationServer(
    clientRepository,
    tokenRepository,
    scopeRepository,
    serviceName,
  )

  const userRepository = createUserRepository(users)
  const authCodeRepository = createAuthCodeRepository(authCodes)

  authServer.enableGrantTypes('refresh_token')
  authServer.enableGrantTypes({
    grant: 'authorization_code',
    authCodeRepository,
    userRepository,
  })

  return new Elysia()
    .get('/authorize', async ({request}) =>
      requestFromVanilla(request)
        .then(async (req) => {
          // console.log('req', req)
          const authReq = await authServer.validateAuthorizationRequest(req)
          // console.log('authReq', authReq)
          authReq.isAuthorizationApproved = true
          authReq.user = userRepository.users[0]
          const authRes = await authServer.completeAuthorizationRequest(authReq)
          // console.log('authRes', authRes)
          return authRes
        })
        .catch((err: unknown) => {
          console.log('/authorize err', err)
          throw err
        })
        .then(responseToVanilla),
    )
    .post('/token', async ({request}) =>
      requestFromVanilla(request)
        .then(async (req) => {
          // console.log('req', req)
          const res = await authServer.respondToAccessTokenRequest(req)
          // console.log('res', res)
          return res
        })
        .catch((err: unknown) => {
          console.log('/token err', err)
          throw err
        })
        .then(responseToVanilla),
    )
    .post('/token/introspect', async ({request}) =>
      requestFromVanilla(request)
        .then(async (req) => {
          const res = await authServer.introspect(req)
          return res
        })
        .catch((err: unknown) => {
          console.log('/token/introspect err', err)
          throw err
        })
        .then(responseToVanilla),
    )
    .post('/token/revoke', async ({request}) =>
      requestFromVanilla(request)
        .then(async (req) => {
          const res = await authServer.revoke(req)
          return res
        })
        .catch((err: unknown) => {
          console.log('/token/revoke err', err)
          throw err
        })
        .then(responseToVanilla),
    )
}
export function createClientRepository(initialClients: OAuthClient[] = []) {
  const clients = [...initialClients]

  return {
    async getByIdentifier(clientId) {
      const client = clients.find((c) => c.id === clientId)
      // console.log('getByIdentifier', clientId, client)
      if (!client) {
        throw new Error(`Client not found: ${clientId}`)
      }
      return client
    },

    async isClientValid(grantType, client, clientSecret) {
      // console.log('isClientValid', grantType, client, clientSecret)
      // Verify the client secret if provided
      if (clientSecret && client.secret !== clientSecret) {
        return false
      }

      // Check if the grant type is allowed for this client
      return client.allowedGrants.includes(grantType)
    },
  } satisfies OAuthClientRepository
}

export function createTokenRepository(initialTokens: OAuthToken[] = []) {
  const tokens = [...initialTokens]

  return {
    async issueToken(client, scopes, user) {
      const token = {
        accessToken: crypto.randomUUID(),
        refreshToken: crypto.randomUUID(),
        accessTokenExpiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
        scopes,
        client,
        user,
      }
      await this.persist(token)
      return token
    },

    async issueRefreshToken(accessToken, client) {
      const token = {
        accessToken: crypto.randomUUID(),
        refreshToken: crypto.randomUUID(),
        accessTokenExpiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
        scopes: accessToken.scopes,
        client,
        user: accessToken.user,
      }
      await this.persist(token)
      return token
    },

    async persist(accessToken) {
      tokens.push(accessToken)
    },

    async revoke(accessToken) {
      const index = tokens.findIndex(
        (token) => token.accessToken === accessToken.accessToken,
      )
      if (index !== -1) {
        tokens.splice(index, 1)
      }
    },

    async revokeDescendantsOf(_authCodeId) {
      throw new Error('Not implemented')
    },

    async isRefreshTokenRevoked(refreshToken) {
      return !tokens.some(
        (token) => token.refreshToken === refreshToken.refreshToken,
      )
    },

    async getByRefreshToken(refreshTokenToken) {
      const token = tokens.find(
        (token) => token.refreshToken === refreshTokenToken,
      )
      // Type is wrong here, null means token not found
      return token ?? (null as unknown as OAuthToken)
    },

    async getByAccessToken(accessTokenToken) {
      const token = tokens.find(
        (token) => token.accessToken === accessTokenToken,
      )
      // Type is wrong here, null means token not found
      return token ?? (null as unknown as OAuthToken)
    },
  } satisfies OAuthTokenRepository
}

export function createScopeRepository(initialScopes: OAuthScope[] = []) {
  const scopes = [...initialScopes]

  return {
    async getAllByIdentifiers(scopeNames) {
      return scopeNames.map((name) => {
        const scope = scopes.find((s) => s.name === name)
        return (
          scope || {
            name,
            description: `Scope for ${name}`,
          }
        )
      })
    },

    async finalize(scopes, _identifier, client, _user_id) {
      // Return the requested scopes that are allowed for this client
      return scopes.filter((scope) =>
        client.scopes.some((clientScope) => clientScope.name === scope.name),
      )
    },
  } satisfies OAuthScopeRepository
}

export function createAuthCodeRepository(
  initialAuthCodes: OAuthAuthCode[] = [],
) {
  const authCodes = [...initialAuthCodes]

  return {
    async getByIdentifier(authCodeCode) {
      const authCode = authCodes.find((code) => code.code === authCodeCode)
      if (!authCode) {
        throw new Error(`Auth code not found: ${authCodeCode}`)
      }
      return authCode
    },

    async issueAuthCode(client, user, scopes) {
      const authCode = {
        code: Math.random().toString(36).substring(2),
        client,
        user,
        scopes,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
        redirectUri: client.redirectUris[0],
        codeChallenge: null,
        codeChallengeMethod: null,
      }
      await this.persist(authCode)
      return authCode
    },

    async persist(authCode) {
      authCodes.push(authCode)
    },

    async isRevoked(authCodeCode) {
      try {
        const authCode = await this.getByIdentifier(authCodeCode)
        return authCode.expiresAt < new Date()
      } catch {
        return true
      }
    },

    async revoke(authCodeCode) {
      const index = authCodes.findIndex((code) => code.code === authCodeCode)
      if (index !== -1) {
        authCodes.splice(index, 1)
      }
    },
  } satisfies OAuthAuthCodeRepository
}

export function createUserRepository(initialUsers: OAuthUser[] = []) {
  const users = [...initialUsers]

  const repo = {
    async getUserByCredentials(identifier, _password, _grantType, _client) {
      const user = users.find((user) => {
        if (typeof identifier === 'string') {
          return user.id === identifier
        }
        return user.id === identifier
      })
      return user
    },
  } satisfies OAuthUserRepository

  return {
    users,
    ...repo,
  }
}

export type {OAuthAuthCode, OAuthClient, OAuthScope, OAuthToken, OAuthUser}
