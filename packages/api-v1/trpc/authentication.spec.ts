/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
import type {Id, Viewer} from '@openint/cdk'

import {TRPCError} from '@trpc/server'
import {makeId} from '@openint/cdk'
import {schema} from '@openint/db'
import {describeEachDatabase} from '@openint/db/__tests__/test-utils'
import {envRequired} from '@openint/env'
import {makeUlid} from '@openint/util/id-utils'
import {createApp} from '../app'
import {makeJwtClient} from '../lib/makeJwtClient'
import {viewerFromRequest} from './authentication'

describeEachDatabase({drivers: ['pglite'], migrate: true}, (db) => {
  // Setup real database
  const jwtClient = makeJwtClient({secretOrPublicKey: envRequired.JWT_SECRET})

  // Test data
  const testOrgId = `org_${makeUlid()}` as Id['org']
  const testApiKey = `apikey_${makeUlid()}`
  const testUserId = `user_${makeUlid()}` as Id['user']

  beforeAll(async () => {
    await db.insert(schema.organization).values({
      id: testOrgId,
      api_key: testApiKey,
    })
  })

  describe('Authorization header parsing', () => {
    it('should be anonymous if missing', async () => {
      // Arrange
      const req = new Request('https://localhost')
      const ctx = {db}

      // Act & Assert
      await expect(viewerFromRequest(ctx, req)).resolves.toEqual({role: 'anon'})
    })

    it('should throw UNAUTHORIZED when authorization header is malformed', async () => {
      // Arrange
      const headers = new Headers()
      headers.set('authorization', 'InvalidFormat token123')
      const req = new Request('https://localhost', {headers})
      const ctx = {db}

      // Act & Assert
      await expect(viewerFromRequest(ctx, req)).rejects.toThrow(TRPCError)
      await expect(viewerFromRequest(ctx, req)).rejects.toThrow(
        'Invalid Authorization header, expecting Bearer with token',
      )
    })
  })

  describe('API key authentication', () => {
    it('should authenticate with valid API key', async () => {
      // Arrange
      const headers = new Headers()
      headers.set('authorization', `Bearer ${testApiKey}`)
      const req = new Request('https://localhost', {headers})
      const ctx = {db}

      // Act
      const result = await viewerFromRequest(ctx, req)

      // Assert
      expect(result).toEqual({
        role: 'org',
        orgId: testOrgId,
      })
    })

    it('should throw UNAUTHORIZED with invalid API key', async () => {
      // Arrange
      const headers = new Headers()
      headers.set('authorization', 'Bearer invalid-api-key-that-doesnt-exist')
      const req = new Request('https://localhost', {headers})
      const ctx = {db}

      // Act & Assert
      await expect(viewerFromRequest(ctx, req)).rejects.toThrow(TRPCError)
      await expect(viewerFromRequest(ctx, req)).rejects.toThrow(
        'Invalid API key',
      )
    })
  })

  describe('JWT authentication', () => {
    it('should authenticate with valid JWT token', async () => {
      // Arrange
      // Create a real JWT token
      const expectedViewer: Viewer = {
        role: 'user',
        userId: testUserId,
        orgId: testOrgId,
      }
      const token = await jwtClient.signToken(expectedViewer)

      const headers = new Headers()
      headers.set('authorization', `Bearer ${token}`)
      const req = new Request('https://localhost', {headers})
      const ctx = {db}

      // Act
      const result = await viewerFromRequest(ctx, req)

      // Assert
      expect(result).toEqual(expectedViewer)
    })

    it('should throw UNAUTHORIZED with invalid JWT token', async () => {
      // Arrange
      const headers = new Headers()
      headers.set('authorization', 'Bearer invalid.jwt.token')
      const req = new Request('https://localhost', {headers})
      const ctx = {db}

      // Act & Assert
      await expect(viewerFromRequest(ctx, req)).rejects.toThrow('invalid')
    })

    it('should throw UNAUTHORIZED with expired JWT token', async () => {
      // Arrange
      // Create an expired JWT token (expires in -1 second)
      const jwtClientWithExpiry = makeJwtClient({
        secretOrPublicKey: envRequired.JWT_SECRET,
      })
      const expiredToken = await jwtClientWithExpiry.signToken(
        {
          role: 'user',
          userId: testUserId,
          orgId: testOrgId,
        },
        {validityInSeconds: -1000},
      )

      const headers = new Headers()
      headers.set('authorization', `Bearer ${expiredToken}`)
      const req = new Request('https://localhost', {headers})
      const ctx = {db}

      // Act & Assert
      await expect(viewerFromRequest(ctx, req)).rejects.toThrow('JWTExpired')
    })
  })

  describe('Unauthenticated getConnection whitelist', () => {
    const whitelistedOrg = 'org_30tX19eKICtpokzSfMWDOiLU3KK' as Id['org']
    const nonWhitelistedOrg = `org_${makeUlid()}` as Id['org']
    let app: ReturnType<typeof createApp>
    let whitelistedConnectionId = ''
    let nonWhitelistedConnectionId = ''

    beforeAll(async () => {
      app = createApp({db})
      // Create a whitelisted org and a connector_config + connection
      await db.insert(schema.organization).values({id: whitelistedOrg})
      const [ccfg1] = await db
        .insert(schema.connector_config)
        .values({
          id: makeId('ccfg', 'plaid', makeUlid()),
          org_id: whitelistedOrg,
          config: {},
        })
        .returning()
      const [conn1] = await db
        .insert(schema.connection)
        .values({
          id: makeId('conn', 'plaid', makeUlid()),
          connector_config_id: ccfg1!.id,
          settings: {},
        })
        .returning()
      whitelistedConnectionId = conn1!.id

      // Create a non-whitelisted org and a connector_config + connection
      await db.insert(schema.organization).values({id: nonWhitelistedOrg})
      const [ccfg2] = await db
        .insert(schema.connector_config)
        .values({
          id: makeId('ccfg', 'plaid', makeUlid()),
          org_id: nonWhitelistedOrg,
          config: {},
        })
        .returning()
      const [conn2] = await db
        .insert(schema.connection)
        .values({
          id: makeId('conn', 'plaid', makeUlid()),
          connector_config_id: ccfg2!.id,
          settings: {},
        })
        .returning()
      nonWhitelistedConnectionId = conn2!.id
    })

    test('allows GET /connection/{id} for whitelisted org without auth', async () => {
      const res = await app.handle(
        new Request(
          `http://localhost/v1/connection/${whitelistedConnectionId}`,
        ),
      )
      expect(res.status).toBe(200)
      const data = await res.json()
      expect(data.id).toBe(whitelistedConnectionId)
    })

    test('rejects GET /connection/{id} for non-whitelisted org without auth', async () => {
      const res = await app.handle(
        new Request(
          `http://localhost/v1/connection/${nonWhitelistedConnectionId}`,
        ),
      )
      expect(res.status).toBe(403)
      const body = await res.json()
      expect(body.message).toMatch(/Authentication required/)
    })
  })
})
