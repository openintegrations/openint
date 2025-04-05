import {
  AuthorizationServer,
  GrantIdentifier,
  OAuthAuthCode,
  OAuthAuthCodeRepository,
  OAuthClient,
  OAuthClientRepository,
  OAuthScope,
  OAuthScopeRepository,
  OAuthToken,
  OAuthTokenRepository,
  OAuthUser,
  OAuthUserIdentifier,
  OAuthUserRepository,
} from '@jmondi/oauth2-server'
import {Elysia} from 'elysia'
import {requestFromVanilla, responseToVanilla} from './utils'

export function createClientRepository(initialClients: OAuthClient[] = []) {
  const clients = [...initialClients]

  return {
    async getByIdentifier(clientId: string): Promise<OAuthClient> {
      const client = clients.find((c) => c.id === clientId)
      console.log('getByIdentifier', clientId, client)
      if (!client) {
        throw new Error(`Client not found: ${clientId}`)
      }
      return client
    },

    async isClientValid(
      grantType: GrantIdentifier,
      client: OAuthClient,
      clientSecret?: string,
    ): Promise<boolean> {
      console.log('isClientValid', grantType, client, clientSecret)
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
    async issueToken(
      client: OAuthClient,
      scopes: OAuthScope[],
      user?: OAuthUser | null,
    ): Promise<OAuthToken> {
      const token: OAuthToken = {
        accessToken: crypto.randomUUID(),
        refreshToken: crypto.randomUUID(),
        accessTokenExpiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
        scopes: scopes,
        client,
        user: user,
      }
      await this.persist(token)
      return token
    },

    async issueRefreshToken(
      accessToken: OAuthToken,
      client: OAuthClient,
    ): Promise<OAuthToken> {
      const token: OAuthToken = {
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

    async persist(accessToken: OAuthToken): Promise<void> {
      tokens.push(accessToken)
    },

    async revoke(accessToken: OAuthToken): Promise<void> {
      const index = tokens.findIndex(
        (token) => token.accessToken === accessToken.accessToken,
      )
      if (index !== -1) {
        tokens.splice(index, 1)
      }
    },

    async revokeDescendantsOf(authCodeId: string): Promise<void> {
      // In this simple implementation, we don't track relationships between tokens
      return
    },

    async isRefreshTokenRevoked(refreshToken: OAuthToken): Promise<boolean> {
      return !tokens.some(
        (token) => token.refreshToken === refreshToken.refreshToken,
      )
    },

    async getByRefreshToken(refreshTokenToken: string): Promise<OAuthToken> {
      const token = tokens.find(
        (token) => token.refreshToken === refreshTokenToken,
      )
      if (!token) {
        throw new Error('Refresh token not found')
      }
      return token
    },

    async getByAccessToken(accessTokenToken: string): Promise<OAuthToken> {
      const token = tokens.find(
        (token) => token.accessToken === accessTokenToken,
      )
      if (!token) {
        throw new Error('Access token not found')
      }
      return token
    },
  } satisfies OAuthTokenRepository
}

export function createScopeRepository(initialScopes: OAuthScope[] = []) {
  const scopes = [...initialScopes]

  return {
    async getAllByIdentifiers(scopeNames: string[]): Promise<OAuthScope[]> {
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

    async finalize(
      scopes: OAuthScope[],
      identifier: GrantIdentifier,
      client: OAuthClient,
      user_id?: string,
    ): Promise<OAuthScope[]> {
      // Return the requested scopes that are allowed for this client
      return scopes.filter((scope) =>
        client.scopes.some((clientScope) => clientScope.name === scope.name),
      )
    },
  } satisfies OAuthScopeRepository
}

export function createAuthCodeRepository() {
  const authCodes: OAuthAuthCode[] = []

  return {
    async getByIdentifier(authCodeCode: string): Promise<OAuthAuthCode> {
      const authCode = authCodes.find((code) => code.code === authCodeCode)
      if (!authCode) {
        throw new Error(`Auth code not found: ${authCodeCode}`)
      }
      return authCode
    },

    async issueAuthCode(
      client: OAuthClient,
      user: OAuthUser | undefined,
      scopes: OAuthScope[],
    ): Promise<OAuthAuthCode> {
      const authCode: OAuthAuthCode = {
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

    async persist(authCode: OAuthAuthCode): Promise<void> {
      authCodes.push(authCode)
    },

    async isRevoked(authCodeCode: string): Promise<boolean> {
      try {
        const authCode = await this.getByIdentifier(authCodeCode)
        return authCode.expiresAt < new Date()
      } catch {
        return true
      }
    },

    async revoke(authCodeCode: string): Promise<void> {
      const index = authCodes.findIndex((code) => code.code === authCodeCode)
      if (index !== -1) {
        authCodes.splice(index, 1)
      }
    },
  } satisfies OAuthAuthCodeRepository
}

export function createUserRepository(initialUsers: OAuthUser[] = []) {
  const users = [...initialUsers]

  return {
    async getUserByCredentials(
      identifier: OAuthUserIdentifier,
      _password?: string,
      _grantType?: GrantIdentifier,
      _client?: OAuthClient,
    ): Promise<OAuthUser | undefined> {
      const user = users.find((user) => {
        if (typeof identifier === 'string') {
          return user.id === identifier
        }
        return user.id === identifier
      })
      return user
    },
  } satisfies OAuthUserRepository
}

// Create Elysia routes for OAuth endpoints
export function elysiaFromAuthorizationServer(authServer: AuthorizationServer) {
  return new Elysia()
    .get('/authorize', async ({request}) => {
      return requestFromVanilla(request)
        .then(async (req) => {
          console.log('req', req)
          const authReq = await authServer.validateAuthorizationRequest(req)
          console.log('authReq', authReq)
          authReq.isAuthorizationApproved = true
          authReq.user = {id: 'user1', username: 'testuser'}
          const authRes = await authServer.completeAuthorizationRequest(authReq)
          console.log('authRes', authRes)
          return authRes
        })
        .catch((err) => {
          console.log('err', err)
          throw err
        })
        .then(responseToVanilla)
    })
    .post('/token', async ({request}) => {
      return requestFromVanilla(request)
        .then(async (req) => {
          console.log('req', req)
          const res = await authServer.respondToAccessTokenRequest(req)
          console.log('res', res)
          return res
        })
        .catch((err) => {
          console.log('err', err)
          throw err
        })
        .then(responseToVanilla)
    })

    .post('/introspect', async () => {})
    .post('/revoke', async () => {})
}
