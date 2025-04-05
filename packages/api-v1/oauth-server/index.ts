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

export class ClientRepository implements OAuthClientRepository {
  private clients: OAuthClient[] = []

  constructor(initialClients: OAuthClient[] = []) {
    this.clients = initialClients
  }

  async getByIdentifier(clientId: string): Promise<OAuthClient> {
    const client = this.clients.find((c) => c.id === clientId)
    console.log('getByIdentifier', clientId, client)
    if (!client) {
      throw new Error(`Client not found: ${clientId}`)
    }
    return client
  }

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
  }
}

// Define the OAuth token repository
export class TokenRepository implements OAuthTokenRepository {
  private tokens: OAuthToken[] = []

  constructor(initialTokens: OAuthToken[] = []) {
    this.tokens = initialTokens
  }

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
  }

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
  }

  async persist(accessToken: OAuthToken): Promise<void> {
    this.tokens.push(accessToken)
  }

  async revoke(accessToken: OAuthToken): Promise<void> {
    this.tokens = this.tokens.filter(
      (token) => token.accessToken !== accessToken.accessToken,
    )
  }

  async revokeDescendantsOf(authCodeId: string): Promise<void> {
    // In this simple implementation, we don't track relationships between tokens
    return
  }

  async isRefreshTokenRevoked(refreshToken: OAuthToken): Promise<boolean> {
    return !this.tokens.some(
      (token) => token.refreshToken === refreshToken.refreshToken,
    )
  }

  async getByRefreshToken(refreshTokenToken: string): Promise<OAuthToken> {
    const token = this.tokens.find(
      (token) => token.refreshToken === refreshTokenToken,
    )
    if (!token) {
      throw new Error('Refresh token not found')
    }
    return token
  }

  async getByAccessToken(accessTokenToken: string): Promise<OAuthToken> {
    const token = this.tokens.find(
      (token) => token.accessToken === accessTokenToken,
    )
    if (!token) {
      throw new Error('Access token not found')
    }
    return token
  }
}

// Define the OAuth scope repository
export class ScopeRepository implements OAuthScopeRepository {
  private scopes: OAuthScope[] = []

  constructor(initialScopes: OAuthScope[] = []) {
    this.scopes = initialScopes
  }

  async getAllByIdentifiers(scopeNames: string[]): Promise<OAuthScope[]> {
    return scopeNames.map((name) => {
      const scope = this.scopes.find((s) => s.name === name)
      return (
        scope || {
          name,
          description: `Scope for ${name}`,
        }
      )
    })
  }

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
  }
}

export class AuthCodeRepository implements OAuthAuthCodeRepository {
  private authCodes: OAuthAuthCode[] = []

  async getByIdentifier(authCodeCode: string): Promise<OAuthAuthCode> {
    const authCode = this.authCodes.find((code) => code.code === authCodeCode)
    if (!authCode) {
      throw new Error(`Auth code not found: ${authCodeCode}`)
    }
    return authCode
  }

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
  }

  async persist(authCode: OAuthAuthCode): Promise<void> {
    this.authCodes.push(authCode)
  }

  async isRevoked(authCodeCode: string): Promise<boolean> {
    try {
      const authCode = await this.getByIdentifier(authCodeCode)
      return authCode.expiresAt < new Date()
    } catch {
      return true
    }
  }

  async revoke(authCodeCode: string): Promise<void> {
    this.authCodes = this.authCodes.filter((code) => code.code !== authCodeCode)
  }
}

export class UserRepository implements OAuthUserRepository {
  private users: OAuthUser[] = []

  constructor(initialUsers: OAuthUser[] = []) {
    this.users = initialUsers
  }

  async getUserByCredentials(
    identifier: OAuthUserIdentifier,
    _password?: string,
    _grantType?: GrantIdentifier,
    _client?: OAuthClient,
  ): Promise<OAuthUser | undefined> {
    const user = this.users.find((user) => {
      if (typeof identifier === 'string') {
        return user.id === identifier
      }
      return user.id === identifier
    })
    return user
  }
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
