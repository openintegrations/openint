// import {beforeAll, describe, expect, it} from '@jest/globals'
// import {applyLinks} from '@opensdks/fetch-links'
// import {loopbackLink} from '@openint/loopback-link'
// import {
//   ClientRepository,
//   createTestOauthElysia,
//   OAuthClientModel,
//   OAuthScopeModel,
//   OAuthUserModel,
//   ScopeRepository,
//   TokenRepository,
//   UserRepository,
// } from './index'

import {
  AuthorizationServer,
  OAuthClient,
  OAuthScope,
} from '@jmondi/oauth2-server'
import {withLoopback} from '@openint/loopback-link'
import {
  AuthCodeRepository,
  ClientRepository,
  elysiaFromAuthorizationServer,
  ScopeRepository,
  TokenRepository,
  UserRepository,
} from '.'

// describe('OAuth Server', () => {
//   describe('ClientRepository', () => {
//     it('should create a client repository with initial clients', () => {
//       const clients: OAuthClientModel[] = [
//         {
//           id: 'client1',
//           name: 'Test Client',
//           secret: 'secret1',
//           redirectUris: ['http://localhost:3000/callback'],
//           allowedGrantTypes: ['authorization_code', 'refresh_token'],
//           allowedScopes: ['read', 'write'],
//           userId: 'user1',
//         },
//       ]

//       const repository = new ClientRepository(clients)
//       expect(repository).toBeDefined()
//     })

//     it('should get a client by identifier', async () => {
//       const clients: OAuthClientModel[] = [
//         {
//           id: 'client1',
//           name: 'Test Client',
//           secret: 'secret1',
//           redirectUris: ['http://localhost:3000/callback'],
//           allowedGrantTypes: ['authorization_code', 'refresh_token'],
//           allowedScopes: ['read', 'write'],
//           userId: 'user1',
//         },
//       ]

//       const repository = new ClientRepository(clients)
//       const client = await repository.getByIdentifier('client1')

//       expect(client.id).toBe('client1')
//       expect(client.name).toBe('Test Client')
//       expect(client.secret).toBe('secret1')
//       expect(client.redirectUris).toEqual(['http://localhost:3000/callback'])
//       expect(client.allowedGrants).toEqual([
//         'authorization_code',
//         'refresh_token',
//       ])
//       expect(client.scopes).toEqual([{name: 'read'}, {name: 'write'}])
//       expect(client.userId).toBe('user1')
//     })

//     it('should throw an error when getting a non-existent client', async () => {
//       const repository = new ClientRepository()

//       await expect(repository.getByIdentifier('non-existent')).rejects.toThrow(
//         'Client with ID non-existent not found',
//       )
//     })

//     it('should validate a client', async () => {
//       const clients: OAuthClientModel[] = [
//         {
//           id: 'client1',
//           name: 'Test Client',
//           secret: 'secret1',
//           redirectUris: ['http://localhost:3000/callback'],
//           allowedGrantTypes: ['authorization_code', 'refresh_token'],
//           allowedScopes: ['read', 'write'],
//           userId: 'user1',
//         },
//       ]

//       const repository = new ClientRepository(clients)

//       const isValid = await repository.validateClient(
//         'client1',
//         'secret1',
//         'authorization_code',
//       )

//       expect(isValid).toBe(true)
//     })

//     it('should validate a redirect URI', async () => {
//       const clients: OAuthClientModel[] = [
//         {
//           id: 'client1',
//           name: 'Test Client',
//           secret: 'secret1',
//           redirectUris: ['http://localhost:3000/callback'],
//           allowedGrantTypes: ['authorization_code', 'refresh_token'],
//           allowedScopes: ['read', 'write'],
//           userId: 'user1',
//         },
//       ]

//       const repository = new ClientRepository(clients)

//       const isValid = await repository.validateRedirectUri(
//         'client1',
//         'http://localhost:3000/callback',
//       )

//       expect(isValid).toBe(true)
//     })

//     it('should check if a client is valid', async () => {
//       const clients: OAuthClientModel[] = [
//         {
//           id: 'client1',
//           name: 'Test Client',
//           secret: 'secret1',
//           redirectUris: ['http://localhost:3000/callback'],
//           allowedGrantTypes: ['authorization_code', 'refresh_token'],
//           allowedScopes: ['read', 'write'],
//           userId: 'user1',
//         },
//       ]

//       const repository = new ClientRepository(clients)

//       const isValid = await repository.isClientValid('client1')
//       expect(isValid).toBe(true)

//       const isInvalid = await repository.isClientValid('non-existent')
//       expect(isInvalid).toBe(false)
//     })
//   })

//   describe('UserRepository', () => {
//     it('should create a user repository with initial users', () => {
//       const users: OAuthUserModel[] = [
//         {
//           id: 'user1',
//           email: 'user@example.com',
//           password: 'password',
//         },
//       ]

//       const repository = new UserRepository(users)
//       expect(repository).toBeDefined()
//     })

//     it('should get a user by identifier', async () => {
//       const users: OAuthUserModel[] = [
//         {
//           id: 'user1',
//           email: 'user@example.com',
//           password: 'password',
//         },
//       ]

//       const repository = new UserRepository(users)
//       const user = await repository.getUserByIdentifier('user1')

//       expect(user.id).toBe('user1')
//       expect(user.email).toBe('user@example.com')
//       expect(user.password).toBe('password')
//     })

//     it('should throw an error when getting a non-existent user', async () => {
//       const repository = new UserRepository()

//       await expect(
//         repository.getUserByIdentifier('non-existent'),
//       ).rejects.toThrow('User with ID non-existent not found')
//     })

//     it('should get a user by credentials', async () => {
//       const users: OAuthUserModel[] = [
//         {
//           id: 'user1',
//           email: 'user@example.com',
//           password: 'password',
//         },
//       ]

//       const repository = new UserRepository(users)
//       const user = await repository.getUserByCredentials(
//         'user@example.com',
//         'password',
//       )

//       expect(user.id).toBe('user1')
//       expect(user.email).toBe('user@example.com')
//       expect(user.password).toBe('password')
//     })

//     it('should throw an error when getting a user with invalid credentials', async () => {
//       const users: OAuthUserModel[] = [
//         {
//           id: 'user1',
//           email: 'user@example.com',
//           password: 'password',
//         },
//       ]

//       const repository = new UserRepository(users)

//       await expect(
//         repository.getUserByCredentials('user@example.com', 'wrong-password'),
//       ).rejects.toThrow('Invalid credentials')
//     })
//   })

//   describe('ScopeRepository', () => {
//     it('should create a scope repository with initial scopes', () => {
//       const scopes: OAuthScopeModel[] = [
//         {
//           name: 'read',
//           description: 'Read access',
//         },
//         {
//           name: 'write',
//           description: 'Write access',
//         },
//       ]

//       const repository = new ScopeRepository(scopes)
//       expect(repository).toBeDefined()
//     })

//     it('should get all scopes', async () => {
//       const scopes: OAuthScopeModel[] = [
//         {
//           name: 'read',
//           description: 'Read access',
//         },
//         {
//           name: 'write',
//           description: 'Write access',
//         },
//       ]

//       const repository = new ScopeRepository(scopes)
//       const allScopes = await repository.getAllScopes()

//       expect(allScopes).toHaveLength(2)
//       expect(allScopes[0].name).toBe('read')
//       expect(allScopes[0].description).toBe('Read access')
//       expect(allScopes[1].name).toBe('write')
//       expect(allScopes[1].description).toBe('Write access')
//     })

//     it('should get scopes by name', async () => {
//       const scopes: OAuthScopeModel[] = [
//         {
//           name: 'read',
//           description: 'Read access',
//         },
//         {
//           name: 'write',
//           description: 'Write access',
//         },
//       ]

//       const repository = new ScopeRepository(scopes)
//       const scopesByName = await repository.getScopesByName(['read'])

//       expect(scopesByName).toHaveLength(1)
//       expect(scopesByName[0].name).toBe('read')
//       expect(scopesByName[0].description).toBe('Read access')
//     })

//     it('should filter out non-existent scopes', async () => {
//       const scopes: OAuthScopeModel[] = [
//         {
//           name: 'read',
//           description: 'Read access',
//         },
//         {
//           name: 'write',
//           description: 'Write access',
//         },
//       ]

//       const repository = new ScopeRepository(scopes)
//       const scopesByName = await repository.getScopesByName([
//         'read',
//         'non-existent',
//       ])

//       expect(scopesByName).toHaveLength(1)
//       expect(scopesByName[0].name).toBe('read')
//       expect(scopesByName[0].description).toBe('Read access')
//     })
//   })

//   describe('TokenRepository', () => {
//     it('should create a token repository', () => {
//       const repository = new TokenRepository()
//       expect(repository).toBeDefined()
//     })

//     it('should issue a token', async () => {
//       const repository = new TokenRepository()

//       const client = {
//         id: 'client1',
//         name: 'Test Client',
//         secret: 'secret1',
//         redirectUris: ['http://localhost:3000/callback'],
//         allowedGrants: ['authorization_code', 'refresh_token'],
//         scopes: [{name: 'read'}, {name: 'write'}],
//         userId: 'user1',
//       }

//       const user = {
//         id: 'user1',
//         email: 'user@example.com',
//         password: 'password',
//       }

//       const scopes = [{name: 'read'}, {name: 'write'}]

//       const accessToken = await repository.issueToken(client, user, scopes)

//       expect(accessToken).toBeDefined()
//       expect(typeof accessToken).toBe('string')
//       expect(accessToken.length).toBeGreaterThan(0)
//     })

//     it('should issue a refresh token', async () => {
//       const repository = new TokenRepository()

//       const client = {
//         id: 'client1',
//         name: 'Test Client',
//         secret: 'secret1',
//         redirectUris: ['http://localhost:3000/callback'],
//         allowedGrants: ['authorization_code', 'refresh_token'],
//         scopes: [{name: 'read'}, {name: 'write'}],
//         userId: 'user1',
//       }

//       const user = {
//         id: 'user1',
//         email: 'user@example.com',
//         password: 'password',
//       }

//       const scopes = [{name: 'read'}, {name: 'write'}]

//       const refreshToken = await repository.issueRefreshToken(
//         client,
//         user,
//         scopes,
//       )

//       expect(refreshToken).toBeDefined()
//       expect(typeof refreshToken).toBe('string')
//       expect(refreshToken.length).toBeGreaterThan(0)
//     })

//     it('should find a token', async () => {
//       const repository = new TokenRepository()

//       const client = {
//         id: 'client1',
//         name: 'Test Client',
//         secret: 'secret1',
//         redirectUris: ['http://localhost:3000/callback'],
//         allowedGrants: ['authorization_code', 'refresh_token'],
//         scopes: [{name: 'read'}, {name: 'write'}],
//         userId: 'user1',
//       }

//       const user = {
//         id: 'user1',
//         email: 'user@example.com',
//         password: 'password',
//       }

//       const scopes = [{name: 'read'}, {name: 'write'}]

//       const accessToken = await repository.issueToken(client, user, scopes)
//       const token = await repository.findToken(accessToken)

//       expect(token).toBeDefined()
//       expect(token?.accessToken).toBe(accessToken)
//       expect(token?.client.id).toBe('client1')
//       expect(token?.user.id).toBe('user1')
//       expect(token?.scopes).toHaveLength(2)
//     })

//     it('should return null when finding a non-existent token', async () => {
//       const repository = new TokenRepository()
//       const token = await repository.findToken('non-existent')

//       expect(token).toBeNull()
//     })

//     it('should revoke a token', async () => {
//       const repository = new TokenRepository()

//       const client = {
//         id: 'client1',
//         name: 'Test Client',
//         secret: 'secret1',
//         redirectUris: ['http://localhost:3000/callback'],
//         allowedGrants: ['authorization_code', 'refresh_token'],
//         scopes: [{name: 'read'}, {name: 'write'}],
//         userId: 'user1',
//       }

//       const user = {
//         id: 'user1',
//         email: 'user@example.com',
//         password: 'password',
//       }

//       const scopes = [{name: 'read'}, {name: 'write'}]

//       const accessToken = await repository.issueToken(client, user, scopes)
//       await repository.revokeToken(accessToken)

//       const token = await repository.findToken(accessToken)
//       expect(token).toBeNull()
//     })
//   })
// })

// describe('OAuth Routes', () => {
//   let app: ReturnType<typeof createTestOauthElysia>

//   const handle = (request: Request) => {
//     return applyLinks(request, [loopbackLink(), app.handle])
//   }

//   beforeAll(() => {
//     app = createTestOauthElysia()
//   })

//   it('should handle OAuth authorization request', async () => {
//     // Create a request to the /oauth/authorize endpoint
//     const request = new Request(
//       'http://localhost/oauth/authorize?response_type=code&client_id=client1&redirect_uri=http://localhost:3000/callback&scope=read',
//       {
//         method: 'GET',
//       },
//     )

//     // Handle the request
//     const response = await handle(request)

//     // Check that the response is valid
//     expect(response.status).toBe(200)
//     const responseData = await response.json()
//     expect(responseData).toBeDefined()
//   })

//   it.only('should handle OAuth token request', async () => {
//     // Create a request to the /oauth/token endpoint
//     const request = new Request('http://localhost/oauth/token', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/x-www-form-urlencoded',
//       },
//       body: new URLSearchParams({
//         grant_type: 'client_credentials',
//         client_id: 'client1',
//         client_secret: 'secret1',
//         scope: 'read',
//       }).toString(),
//     })

//     // Handle the request
//     const response = await handle(request)

//     // Check that the response is valid
//     expect(response.status).toBe(200)
//     const responseData = await response.json()
//     expect(responseData).toBeDefined()
//     expect(responseData.access_token).toBeDefined()
//   })

//   it('should handle OAuth token introspection', async () => {
//     // First, get a token
//     const tokenRequest = new Request('http://localhost/oauth/token', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/x-www-form-urlencoded',
//       },
//       body: new URLSearchParams({
//         grant_type: 'client_credentials',
//         client_id: 'client1',
//         client_secret: 'secret1',
//         scope: 'read',
//       }).toString(),
//     })

//     const tokenResponse = await handle(tokenRequest)
//     const tokenData = await tokenResponse.json()
//     const accessToken = tokenData.access_token

//     // Now introspect the token
//     const introspectRequest = new Request('http://localhost/oauth/introspect', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/x-www-form-urlencoded',
//       },
//       body: new URLSearchParams({
//         token: accessToken,
//         token_type_hint: 'access_token',
//       }).toString(),
//     })

//     const introspectResponse = await handle(introspectRequest)

//     // Check that the response is valid
//     expect(introspectResponse.status).toBe(200)
//     const introspectData = await introspectResponse.json()
//     expect(introspectData).toBeDefined()
//     expect(introspectData.active).toBe(true)
//   })

//   it('should handle OAuth token revocation', async () => {
//     // First, get a token
//     const tokenRequest = new Request('http://localhost/oauth/token', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/x-www-form-urlencoded',
//       },
//       body: new URLSearchParams({
//         grant_type: 'client_credentials',
//         client_id: 'client1',
//         client_secret: 'secret1',
//         scope: 'read',
//       }).toString(),
//     })

//     const tokenResponse = await handle(tokenRequest)
//     const tokenData = await tokenResponse.json()
//     const accessToken = tokenData.access_token

//     // Now revoke the token
//     const revokeRequest = new Request('http://localhost/oauth/revoke', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/x-www-form-urlencoded',
//       },
//       body: new URLSearchParams({
//         token: accessToken,
//         token_type_hint: 'access_token',
//       }).toString(),
//     })

//     const revokeResponse = await handle(revokeRequest)

//     // Check that the response is valid
//     expect(revokeResponse.status).toBe(200)
//   })
// })

// Create a default OAuth server with sample data
export function createTestOAuthServer() {
  // Sample clients
  const client: OAuthClient = {
    id: 'client1',
    name: 'Sample Client',
    secret: 'secret1',
    redirectUris: ['http://localhost:3000/callback'],
    allowedGrants: ['authorization_code', 'refresh_token'],
    scopes: [{name: 'read'}, {name: 'write'}],
  }
  const scopes: OAuthScope[] = [
    {
      name: 'read',
      description: 'Read access',
    },
    {
      name: 'write',
      description: 'Write access',
    },
  ]

  const clientRepository = new ClientRepository([client])
  const tokenRepository = new TokenRepository([
    {
      accessToken: 'some_access_token',
      accessTokenExpiresAt: new Date(Date.now() + 60 * 60 * 1000),
      refreshToken: 'some_refresh_token',
      refreshTokenExpiresAt: new Date(Date.now() + 60 * 60 * 1000),
      scopes: [{name: 'read'}, {name: 'write'}],
      client,
    },
  ])
  const scopeRepository = new ScopeRepository(scopes)

  const server = new AuthorizationServer(
    clientRepository,
    tokenRepository,
    scopeRepository,
    'my-service',
  )
  server.enableGrantTypes('refresh_token')
  server.enableGrantTypes({
    grant: 'authorization_code',
    authCodeRepository: new AuthCodeRepository(),
    userRepository: new UserRepository([{id: 'user1', username: 'testuser'}]),
  })
  return server
}

// @ts-expect-error
if (import.meta.main) {
  const app = elysiaFromAuthorizationServer(createTestOAuthServer())

  const authorizeRequest = new Request(
    'http://localhost/authorize?' +
      new URLSearchParams({
        response_type: 'code',
        client_id: 'client1',
        redirect_uri: 'http://localhost:3000/callback',
        scope: 'read',
        state: 'xyz',
        // TODO: Figure out how not to have this challenge....
        code_challenge: 'E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM',
        code_challenge_method: 'S256',
      }).toString(),
    {redirect: 'manual'},
  )

  const handleWithLink = withLoopback(app.handle)

  handleWithLink(authorizeRequest)
    .then(async (res) => {
      console.log('asdasdfasdfasdfdas', res)
    })
    .catch((err) => {
      console.log('err', err)
    })

  // const request = new Request('http://localhost/token', {
  //   method: 'POST',
  //   headers: {
  //     'Content-Type': 'application/x-www-form-urlencoded',
  //   },
  //   body: new URLSearchParams({
  //     grant_type: 'refresh_token',
  //     client_id: 'client1',
  //     client_secret: 'secret1',
  //     refresh_token: 'some_refresh_token',
  //     scope: 'read',
  //   }).toString(),
  // })
  // app.handle(request).then(async (res) => {
  //   console.log(await res.text())
  // })
}
