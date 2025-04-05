import {describe, expect, it} from '@jest/globals'
import {
  ClientRepository,
  OAuthClientModel,
  OAuthScopeModel,
  OAuthUserModel,
  ScopeRepository,
  TokenRepository,
  UserRepository,
} from './index'

describe('OAuth Server', () => {
  describe('ClientRepository', () => {
    it('should create a client repository with initial clients', () => {
      const clients: OAuthClientModel[] = [
        {
          id: 'client1',
          name: 'Test Client',
          secret: 'secret1',
          redirectUris: ['http://localhost:3000/callback'],
          allowedGrantTypes: ['authorization_code', 'refresh_token'],
          allowedScopes: ['read', 'write'],
          userId: 'user1',
        },
      ]

      const repository = new ClientRepository(clients)
      expect(repository).toBeDefined()
    })

    it('should get a client by identifier', async () => {
      const clients: OAuthClientModel[] = [
        {
          id: 'client1',
          name: 'Test Client',
          secret: 'secret1',
          redirectUris: ['http://localhost:3000/callback'],
          allowedGrantTypes: ['authorization_code', 'refresh_token'],
          allowedScopes: ['read', 'write'],
          userId: 'user1',
        },
      ]

      const repository = new ClientRepository(clients)
      const client = await repository.getByIdentifier('client1')

      expect(client.id).toBe('client1')
      expect(client.name).toBe('Test Client')
      expect(client.secret).toBe('secret1')
      expect(client.redirectUris).toEqual(['http://localhost:3000/callback'])
      expect(client.allowedGrants).toEqual([
        'authorization_code',
        'refresh_token',
      ])
      expect(client.scopes).toEqual([{name: 'read'}, {name: 'write'}])
      expect(client.userId).toBe('user1')
    })

    it('should throw an error when getting a non-existent client', async () => {
      const repository = new ClientRepository()

      await expect(repository.getByIdentifier('non-existent')).rejects.toThrow(
        'Client with ID non-existent not found',
      )
    })

    it('should validate a client', async () => {
      const clients: OAuthClientModel[] = [
        {
          id: 'client1',
          name: 'Test Client',
          secret: 'secret1',
          redirectUris: ['http://localhost:3000/callback'],
          allowedGrantTypes: ['authorization_code', 'refresh_token'],
          allowedScopes: ['read', 'write'],
          userId: 'user1',
        },
      ]

      const repository = new ClientRepository(clients)

      const isValid = await repository.validateClient(
        'client1',
        'secret1',
        'authorization_code',
      )

      expect(isValid).toBe(true)
    })

    it('should validate a redirect URI', async () => {
      const clients: OAuthClientModel[] = [
        {
          id: 'client1',
          name: 'Test Client',
          secret: 'secret1',
          redirectUris: ['http://localhost:3000/callback'],
          allowedGrantTypes: ['authorization_code', 'refresh_token'],
          allowedScopes: ['read', 'write'],
          userId: 'user1',
        },
      ]

      const repository = new ClientRepository(clients)

      const isValid = await repository.validateRedirectUri(
        'client1',
        'http://localhost:3000/callback',
      )

      expect(isValid).toBe(true)
    })

    it('should check if a client is valid', async () => {
      const clients: OAuthClientModel[] = [
        {
          id: 'client1',
          name: 'Test Client',
          secret: 'secret1',
          redirectUris: ['http://localhost:3000/callback'],
          allowedGrantTypes: ['authorization_code', 'refresh_token'],
          allowedScopes: ['read', 'write'],
          userId: 'user1',
        },
      ]

      const repository = new ClientRepository(clients)

      const isValid = await repository.isClientValid('client1')
      expect(isValid).toBe(true)

      const isInvalid = await repository.isClientValid('non-existent')
      expect(isInvalid).toBe(false)
    })
  })

  describe('UserRepository', () => {
    it('should create a user repository with initial users', () => {
      const users: OAuthUserModel[] = [
        {
          id: 'user1',
          email: 'user@example.com',
          password: 'password',
        },
      ]

      const repository = new UserRepository(users)
      expect(repository).toBeDefined()
    })

    it('should get a user by identifier', async () => {
      const users: OAuthUserModel[] = [
        {
          id: 'user1',
          email: 'user@example.com',
          password: 'password',
        },
      ]

      const repository = new UserRepository(users)
      const user = await repository.getUserByIdentifier('user1')

      expect(user.id).toBe('user1')
      expect(user.email).toBe('user@example.com')
      expect(user.password).toBe('password')
    })

    it('should throw an error when getting a non-existent user', async () => {
      const repository = new UserRepository()

      await expect(
        repository.getUserByIdentifier('non-existent'),
      ).rejects.toThrow('User with ID non-existent not found')
    })

    it('should get a user by credentials', async () => {
      const users: OAuthUserModel[] = [
        {
          id: 'user1',
          email: 'user@example.com',
          password: 'password',
        },
      ]

      const repository = new UserRepository(users)
      const user = await repository.getUserByCredentials(
        'user@example.com',
        'password',
      )

      expect(user.id).toBe('user1')
      expect(user.email).toBe('user@example.com')
      expect(user.password).toBe('password')
    })

    it('should throw an error when getting a user with invalid credentials', async () => {
      const users: OAuthUserModel[] = [
        {
          id: 'user1',
          email: 'user@example.com',
          password: 'password',
        },
      ]

      const repository = new UserRepository(users)

      await expect(
        repository.getUserByCredentials('user@example.com', 'wrong-password'),
      ).rejects.toThrow('Invalid credentials')
    })
  })

  describe('ScopeRepository', () => {
    it('should create a scope repository with initial scopes', () => {
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

      const repository = new ScopeRepository(scopes)
      expect(repository).toBeDefined()
    })

    it('should get all scopes', async () => {
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

      const repository = new ScopeRepository(scopes)
      const allScopes = await repository.getAllScopes()

      expect(allScopes).toHaveLength(2)
      expect(allScopes[0].name).toBe('read')
      expect(allScopes[0].description).toBe('Read access')
      expect(allScopes[1].name).toBe('write')
      expect(allScopes[1].description).toBe('Write access')
    })

    it('should get scopes by name', async () => {
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

      const repository = new ScopeRepository(scopes)
      const scopesByName = await repository.getScopesByName(['read'])

      expect(scopesByName).toHaveLength(1)
      expect(scopesByName[0].name).toBe('read')
      expect(scopesByName[0].description).toBe('Read access')
    })

    it('should filter out non-existent scopes', async () => {
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

      const repository = new ScopeRepository(scopes)
      const scopesByName = await repository.getScopesByName([
        'read',
        'non-existent',
      ])

      expect(scopesByName).toHaveLength(1)
      expect(scopesByName[0].name).toBe('read')
      expect(scopesByName[0].description).toBe('Read access')
    })
  })

  describe('TokenRepository', () => {
    it('should create a token repository', () => {
      const repository = new TokenRepository()
      expect(repository).toBeDefined()
    })

    it('should issue a token', async () => {
      const repository = new TokenRepository()

      const client = {
        id: 'client1',
        name: 'Test Client',
        secret: 'secret1',
        redirectUris: ['http://localhost:3000/callback'],
        allowedGrants: ['authorization_code', 'refresh_token'],
        scopes: [{name: 'read'}, {name: 'write'}],
        userId: 'user1',
      }

      const user = {
        id: 'user1',
        email: 'user@example.com',
        password: 'password',
      }

      const scopes = [{name: 'read'}, {name: 'write'}]

      const accessToken = await repository.issueToken(client, user, scopes)

      expect(accessToken).toBeDefined()
      expect(typeof accessToken).toBe('string')
      expect(accessToken.length).toBeGreaterThan(0)
    })

    it('should issue a refresh token', async () => {
      const repository = new TokenRepository()

      const client = {
        id: 'client1',
        name: 'Test Client',
        secret: 'secret1',
        redirectUris: ['http://localhost:3000/callback'],
        allowedGrants: ['authorization_code', 'refresh_token'],
        scopes: [{name: 'read'}, {name: 'write'}],
        userId: 'user1',
      }

      const user = {
        id: 'user1',
        email: 'user@example.com',
        password: 'password',
      }

      const scopes = [{name: 'read'}, {name: 'write'}]

      const refreshToken = await repository.issueRefreshToken(
        client,
        user,
        scopes,
      )

      expect(refreshToken).toBeDefined()
      expect(typeof refreshToken).toBe('string')
      expect(refreshToken.length).toBeGreaterThan(0)
    })

    it('should find a token', async () => {
      const repository = new TokenRepository()

      const client = {
        id: 'client1',
        name: 'Test Client',
        secret: 'secret1',
        redirectUris: ['http://localhost:3000/callback'],
        allowedGrants: ['authorization_code', 'refresh_token'],
        scopes: [{name: 'read'}, {name: 'write'}],
        userId: 'user1',
      }

      const user = {
        id: 'user1',
        email: 'user@example.com',
        password: 'password',
      }

      const scopes = [{name: 'read'}, {name: 'write'}]

      const accessToken = await repository.issueToken(client, user, scopes)
      const token = await repository.findToken(accessToken)

      expect(token).toBeDefined()
      expect(token?.accessToken).toBe(accessToken)
      expect(token?.client.id).toBe('client1')
      expect(token?.user.id).toBe('user1')
      expect(token?.scopes).toHaveLength(2)
    })

    it('should return null when finding a non-existent token', async () => {
      const repository = new TokenRepository()
      const token = await repository.findToken('non-existent')

      expect(token).toBeNull()
    })

    it('should revoke a token', async () => {
      const repository = new TokenRepository()

      const client = {
        id: 'client1',
        name: 'Test Client',
        secret: 'secret1',
        redirectUris: ['http://localhost:3000/callback'],
        allowedGrants: ['authorization_code', 'refresh_token'],
        scopes: [{name: 'read'}, {name: 'write'}],
        userId: 'user1',
      }

      const user = {
        id: 'user1',
        email: 'user@example.com',
        password: 'password',
      }

      const scopes = [{name: 'read'}, {name: 'write'}]

      const accessToken = await repository.issueToken(client, user, scopes)
      await repository.revokeToken(accessToken)

      const token = await repository.findToken(accessToken)
      expect(token).toBeNull()
    })
  })
})
