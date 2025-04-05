import {
  AuthorizationServer,
  generateRandomToken,
  GrantIdentifier,
  OAuthClient,
  OAuthClientRepository,
  OAuthScope,
  OAuthTokenRepository,
  OAuthUser,
  OAuthUserRepository,
} from '@jmondi/oauth2-server'
import {Elysia} from 'elysia'

// Define the OAuth client model
export interface OAuthClientModel {
  id: string
  name: string
  secret: string
  redirectUris: string[]
  allowedGrantTypes: string[]
  allowedScopes: string[]
  userId: string
}

// Define the OAuth token model
export interface OAuthTokenModel {
  accessToken: string
  refreshToken?: string
  expiresAt: Date
  scopes: string[]
  clientId: string
  userId: string
}

// Define the OAuth user model
export interface OAuthUserModel {
  id: string
  email: string
  password: string
}

// Define the OAuth scope model
export interface OAuthScopeModel {
  name: string
  description: string
}

// Define the OAuth client repository
export class ClientRepository implements OAuthClientRepository {
  private clients: Map<string, OAuthClientModel> = new Map()

  constructor(clients: OAuthClientModel[] = []) {
    clients.forEach((client) => this.clients.set(client.id, client))
  }

  async getByIdentifier(clientId: string): Promise<OAuthClient> {
    const client = this.clients.get(clientId)
    if (!client) {
      throw new Error(`Client with ID ${clientId} not found`)
    }

    return {
      id: client.id,
      name: client.name,
      secret: client.secret,
      redirectUris: client.redirectUris,
      allowedGrants: client.allowedGrantTypes as GrantIdentifier[],
      scopes: client.allowedScopes.map((scope) => ({name: scope})),
      userId: client.userId,
    }
  }

  async validateClient(
    clientId: string,
    clientSecret: string,
    grantType: GrantIdentifier,
  ): Promise<boolean> {
    const client = await this.getByIdentifier(clientId)
    return (
      client.secret === clientSecret && client.allowedGrants.includes(grantType)
    )
  }

  async validateRedirectUri(
    clientId: string,
    redirectUri: string,
  ): Promise<boolean> {
    const client = await this.getByIdentifier(clientId)
    return client.redirectUris.includes(redirectUri)
  }

  async isClientValid(clientId: string): Promise<boolean> {
    try {
      await this.getByIdentifier(clientId)
      return true
    } catch (error) {
      return false
    }
  }
}

// Define the OAuth token repository
export class TokenRepository implements OAuthTokenRepository {
  private tokens: Map<string, OAuthTokenModel> = new Map()

  async issueToken(
    client: OAuthClient,
    user: OAuthUser,
    scopes: OAuthScope[],
  ): Promise<string> {
    const accessToken = generateRandomToken()
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    this.tokens.set(accessToken, {
      accessToken,
      expiresAt,
      scopes: scopes.map((scope) => scope.name),
      clientId: client.id,
      userId: user.id,
    })

    return accessToken
  }

  async issueRefreshToken(
    client: OAuthClient,
    user: OAuthUser,
    scopes: OAuthScope[],
  ): Promise<string> {
    const refreshToken = generateRandomToken()
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days

    this.tokens.set(refreshToken, {
      accessToken: refreshToken,
      refreshToken,
      expiresAt,
      scopes: scopes.map((scope) => scope.name),
      clientId: client.id,
      userId: user.id,
    })

    return refreshToken
  }

  async findToken(accessToken: string): Promise<{
    accessToken: string
    refreshToken?: string
    accessTokenExpiresAt: Date
    refreshTokenExpiresAt?: Date
    scopes: OAuthScope[]
    client: OAuthClient
    user: OAuthUser
  } | null> {
    const token = this.tokens.get(accessToken)
    if (!token) {
      return null
    }

    const client = await this.getClientById(token.clientId)
    const user = await this.getUserById(token.userId)
    const scopes = await this.getScopesByName(token.scopes)

    return {
      accessToken: token.accessToken,
      refreshToken: token.refreshToken,
      accessTokenExpiresAt: token.expiresAt,
      refreshTokenExpiresAt: token.refreshToken
        ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
        : undefined,
      scopes,
      client,
      user,
    }
  }

  async revokeToken(accessToken: string): Promise<void> {
    this.tokens.delete(accessToken)
  }

  async persist(token: {
    accessToken: string
    refreshToken?: string
    accessTokenExpiresAt: Date
    refreshTokenExpiresAt?: Date
    scopes: OAuthScope[]
    client: OAuthClient
    user: OAuthUser
  }): Promise<void> {
    this.tokens.set(token.accessToken, {
      accessToken: token.accessToken,
      refreshToken: token.refreshToken,
      expiresAt: token.accessTokenExpiresAt,
      scopes: token.scopes.map((scope) => scope.name),
      clientId: token.client.id,
      userId: token.user.id,
    })
  }

  private async getClientById(clientId: string): Promise<OAuthClient> {
    // This is a simplified implementation
    // In a real application, you would fetch the client from a database
    return {
      id: clientId,
      name: 'Client',
      secret: 'secret',
      redirectUris: ['http://localhost:3000/callback'],
      allowedGrants: [
        'authorization_code',
        'refresh_token',
      ] as GrantIdentifier[],
      scopes: [{name: 'read'}, {name: 'write'}],
      userId: 'user1',
    }
  }

  private async getUserById(userId: string): Promise<OAuthUser> {
    // This is a simplified implementation
    // In a real application, you would fetch the user from a database
    return {
      id: userId,
      email: 'user@example.com',
      password: 'password',
    }
  }

  private async getScopesByName(scopeNames: string[]): Promise<OAuthScope[]> {
    return scopeNames.map((name) => ({name}))
  }
}

// Define the OAuth user repository
export class UserRepository implements OAuthUserRepository {
  private users: Map<string, OAuthUserModel> = new Map()

  constructor(users: OAuthUserModel[] = []) {
    users.forEach((user) => this.users.set(user.id, user))
  }

  async getUserByIdentifier(userId: string): Promise<OAuthUser> {
    const user = this.users.get(userId)
    if (!user) {
      throw new Error(`User with ID ${userId} not found`)
    }

    return {
      id: user.id,
      email: user.email,
      password: user.password,
    }
  }

  async getUserByCredentials(
    email: string,
    password: string,
  ): Promise<OAuthUser> {
    const user = Array.from(this.users.values()).find(
      (u) => u.email === email && u.password === password,
    )
    if (!user) {
      throw new Error('Invalid credentials')
    }

    return {
      id: user.id,
      email: user.email,
      password: user.password,
    }
  }
}

// Define the OAuth scope repository
export class ScopeRepository {
  private scopes: Map<string, OAuthScopeModel> = new Map()

  constructor(scopes: OAuthScopeModel[] = []) {
    scopes.forEach((scope) => this.scopes.set(scope.name, scope))
  }

  async getAllScopes(): Promise<OAuthScope[]> {
    return Array.from(this.scopes.values()).map((scope) => ({
      name: scope.name,
      description: scope.description,
    }))
  }

  async getScopesByName(names: string[]): Promise<OAuthScope[]> {
    return names
      .map((name) => this.scopes.get(name))
      .filter((scope): scope is OAuthScopeModel => scope !== undefined)
      .map((scope) => ({
        name: scope.name,
        description: scope.description,
      }))
  }
}

// Define the token generator
export class CustomTokenGenerator implements TokenGenerator {
  generateAccessToken(): string {
    return generateRandomToken()
  }

  generateRefreshToken(): string {
    return generateRandomToken()
  }
}

// Define the OAuth server
export class OAuthServer {
  private authorizationServer: AuthorizationServer
  private clientRepository: ClientRepository
  private tokenRepository: TokenRepository
  private userRepository: UserRepository
  private scopeRepository: ScopeRepository

  constructor(
    clientRepository: ClientRepository,
    tokenRepository: TokenRepository,
    userRepository: UserRepository,
    scopeRepository: ScopeRepository,
  ) {
    this.clientRepository = clientRepository
    this.tokenRepository = tokenRepository
    this.userRepository = userRepository
    this.scopeRepository = scopeRepository

    this.authorizationServer = new AuthorizationServer(
      this.clientRepository,
      this.tokenRepository,
      this.userRepository,
      this.scopeRepository,
    )
  }

  // Handle authorization request
  async handleAuthorizationRequest(req: Request, res: Response): Promise<void> {
    await this.authorizationServer.validateAuthorizationRequest(req)
    const authorizationResponse =
      await this.authorizationServer.completeAuthorizationRequest(req, res)
    await authorizationResponse.send(res)
  }

  // Handle token request
  async handleTokenRequest(req: Request, res: Response): Promise<void> {
    await this.authorizationServer.validateTokenRequest(req)
    const tokenResponse =
      await this.authorizationServer.respondToAccessTokenRequest(req, res)
    await tokenResponse.send(res)
  }

  // Handle token introspection
  async handleIntrospectionRequest(req: Request, res: Response): Promise<void> {
    const introspectionResponse =
      await this.authorizationServer.respondToIntrospectionRequest(req, res)
    await introspectionResponse.send(res)
  }

  // Handle token revocation
  async handleRevocationRequest(req: Request, res: Response): Promise<void> {
    await this.authorizationServer.validateRevocationRequest(req)
    const revocationResponse =
      await this.authorizationServer.respondToRevocationRequest(req, res)
    await revocationResponse.send(res)
  }
}

// Create Elysia routes for OAuth endpoints
export function createOAuthRoutes(oauthServer: OAuthServer): Elysia {
  return new Elysia({prefix: '/oauth'})
    .get('/authorize', async ({request, set}) => {
      const req = new Request(request)
      const res = new Response()

      try {
        await oauthServer.handleAuthorizationRequest(req, res)
        return res.body
      } catch (error) {
        set.status = 400
        return {error: (error as Error).message}
      }
    })
    .post('/token', async ({request, set}) => {
      const req = new Request(request)
      const res = new Response()

      try {
        await oauthServer.handleTokenRequest(req, res)
        return res.body
      } catch (error) {
        set.status = 400
        return {error: (error as Error).message}
      }
    })
    .post('/introspect', async ({request, set}) => {
      const req = new Request(request)
      const res = new Response()

      try {
        await oauthServer.handleIntrospectionRequest(req, res)
        return res.body
      } catch (error) {
        set.status = 400
        return {error: (error as Error).message}
      }
    })
    .post('/revoke', async ({request, set}) => {
      const req = new Request(request)
      const res = new Response()

      try {
        await oauthServer.handleRevocationRequest(req, res)
        return res.body
      } catch (error) {
        set.status = 400
        return {error: (error as Error).message}
      }
    })
}

// Create a default OAuth server with sample data
export function createDefaultOAuthServer(): OAuthServer {
  // Sample clients
  const clients: OAuthClientModel[] = [
    {
      id: 'client1',
      name: 'Sample Client',
      secret: 'secret1',
      redirectUris: ['http://localhost:3000/callback'],
      allowedGrantTypes: ['authorization_code', 'refresh_token'],
      allowedScopes: ['read', 'write'],
      userId: 'user1',
    },
  ]

  // Sample users
  const users: OAuthUserModel[] = [
    {
      id: 'user1',
      email: 'user@example.com',
      password: 'password',
    },
  ]

  // Sample scopes
  const scopes: OAuthScopeModel[] = [
    {
      name: 'read',
      description: 'Read access',
    },
    {
      name: 'write',
      description: 'Write access',
    },
  ]

  const clientRepository = new ClientRepository(clients)
  const tokenRepository = new TokenRepository()
  const userRepository = new UserRepository(users)
  const scopeRepository = new ScopeRepository(scopes)

  return new OAuthServer(
    clientRepository,
    tokenRepository,
    userRepository,
    scopeRepository,
  )
}

// Export a function to create OAuth routes with default server
export function createDefaultOAuthRoutes(): Elysia {
  const oauthServer = createDefaultOAuthServer()
  return createOAuthRoutes(oauthServer)
}
