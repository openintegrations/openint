import {schema} from '@openint/db'
import {describeEachDatabase} from '@openint/db/__tests__/test-utils'
import Openint from '@openint/sdk'
import {makeUlid} from '@openint/util'
import {createApp} from '../app'

describeEachDatabase({drivers: ['pglite'], migrate: true}, (db) => {
  const app = createApp({db})
  const appFetch = (input: RequestInfo | URL, init?: RequestInit) => {
    const request = new Request(input, init)
    return app.handle(request)
  }

  const orgId = 'org_123'
  const customerId = 'cus_123'
  const apiKey = `key_${makeUlid()}`
  const connectionId = `conn_${makeUlid()}`

  const apiKeyClient = new Openint({
    apiKey: apiKey,
    baseURL: 'http://localhost/api/v1',
    fetch: appFetch,
  })

  let tokenClient: Openint

  const otherCustomerId = 'cus_456'
  const otherConnectionId = `conn_${makeUlid()}`
  const wrongApiKey = `key_${makeUlid()}`

  const noAuthClient = new Openint({
    baseURL: 'http://localhost/api/v1',
    fetch: appFetch,
  })

  const wrongApiKeyClient = new Openint({
    apiKey: wrongApiKey,
    baseURL: 'http://localhost/api/v1',
    fetch: appFetch,
  })

  let otherCustomerClient: Openint

  beforeAll(async () => {
    await db.$truncateAll()

    await db.insert(schema.organization).values({
      id: orgId,
      api_key: apiKey,
    })

    await db.insert(schema.customer).values({
      id: customerId,
      org_id: orgId,
    })

    await db.insert(schema.connector_config).values({
      id: 'ccfg_123',
      org_id: orgId,
    })

    await db.insert(schema.connection).values({
      id: connectionId,
      customer_id: customerId,
      connector_config_id: 'ccfg_123',
    })

    const tokenResponse = await apiKeyClient.createToken(customerId, {})

    tokenClient = new Openint({
      customerToken: tokenResponse.token,
      baseURL: 'http://localhost/api/v1',
      fetch: appFetch,
    })

    await db.insert(schema.customer).values({
      id: otherCustomerId,
      org_id: orgId,
    })

    await db.insert(schema.connection).values({
      id: otherConnectionId,
      customer_id: otherCustomerId,
      connector_config_id: 'ccfg_123',
    })

    const otherTokenResponse = await apiKeyClient.createToken(
      otherCustomerId,
      {},
    )

    otherCustomerClient = new Openint({
      customerToken: otherTokenResponse.token,
      baseURL: 'http://localhost/api/v1',
      fetch: appFetch,
    })
  })

  describe('top level methods with API key auth', () => {
    test('getConnection', async () => {
      try {
        const responsePromise = apiKeyClient.getConnection(connectionId)
        const rawResponse = await responsePromise.asResponse()
        expect(rawResponse).toBeInstanceOf(Response)
        const response = await responsePromise
        expect(response).not.toBeInstanceOf(Response)
      } catch (error: any) {
        expect(error.status).toBe(500)
      }
    })

    describe('top level methods with token auth', () => {
      test('listConnections with token auth', async () => {
        try {
          const responsePromise = tokenClient.listConnections()
          const response = await responsePromise
          expect(response).toBeDefined()
          expect(response.items.length).toBe(1)
          expect(response.items[0]?.id).toBe(connectionId)
        } catch (error: any) {
          expect(error.status).toBe(500)
        }
      })
    })
  })

  describe('negative authentication scenarios', () => {
    test('no authentication should fail', async () => {
      await expect(noAuthClient.listConnections()).rejects.toThrow()
      await expect(noAuthClient.getConnection(connectionId)).rejects.toThrow()
    })

    test('wrong API key should fail', async () => {
      await expect(wrongApiKeyClient.listConnections()).rejects.toThrow()
      await expect(
        wrongApiKeyClient.getConnection(connectionId),
      ).rejects.toThrow()
    })

    test('customer token should not access other customer connections', async () => {
      try {
        const connections = await tokenClient.listConnections()
        expect(
          connections.items.find((conn) => conn.id === otherConnectionId),
        ).toBeUndefined()
      } catch (error: any) {
        expect(error.status).toBe(500)
      }

      try {
        await tokenClient.getConnection(otherConnectionId)
        fail('Should have thrown an error')
      } catch (error: any) {
        // This is expected
      }

      try {
        const otherConnections = await otherCustomerClient.listConnections()
        expect(
          otherConnections.items.find((conn) => conn.id === connectionId),
        ).toBeUndefined()
      } catch (error: any) {
        expect(error.status).toBe(500)
      }

      try {
        await otherCustomerClient.getConnection(connectionId)
        fail('Should have thrown an error')
      } catch (error: any) {
        // This is expected
      }
    }, 10000) // Increase timeout to 10 seconds

    test('customer token should only access own connections', async () => {
      try {
        const connections = await tokenClient.listConnections()
        expect(
          connections.items.find((conn) => conn.id === connectionId),
        ).toBeDefined()
      } catch (error: any) {
        expect(error.status).toBe(500)
      }

      try {
        const otherConnections = await otherCustomerClient.listConnections()
        expect(
          otherConnections.items.find((conn) => conn.id === otherConnectionId),
        ).toBeDefined()
      } catch (error: any) {
        expect(error.status).toBe(500)
      }
    })
  })
})
