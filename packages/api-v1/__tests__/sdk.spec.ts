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

  // Organization setup
  const orgId = 'org_123'
  const apiKey = `key_${makeUlid()}`

  // Customer 1 setup
  const customerId = 'cus_123'
  const connectionId = `conn_${makeUlid()}`

  // Customer 2 setup
  const otherCustomerId = 'cus_456'
  const otherConnectionId = `conn_${makeUlid()}`

  // Invalid auth setup
  const wrongApiKey = `key_${makeUlid()}`

  // Client definitions
  const apiKeyClient = new Openint({
    apiKey: apiKey,
    baseURL: 'http://localhost/api/v1',
    fetch: appFetch,
  })

  const noAuthClient = new Openint({
    baseURL: 'http://localhost/api/v1',
    fetch: appFetch,
  })

  const wrongApiKeyClient = new Openint({
    apiKey: wrongApiKey,
    baseURL: 'http://localhost/api/v1',
    fetch: appFetch,
  })

  // Token clients will be initialized in beforeAll
  let tokenClient: Openint
  let otherCustomerClient: Openint

  beforeAll(async () => {
    await db.$truncateAll()

    // Insert organization
    await db.insert(schema.organization).values({
      id: orgId,
      api_key: apiKey,
    })

    // Insert connector config (shared)
    await db.insert(schema.connector_config).values({
      id: 'ccfg_123',
      org_id: orgId,
    })

    // Setup Customer 1 and their connection
    await db.insert(schema.customer).values({
      id: customerId,
      org_id: orgId,
    })

    await db.insert(schema.connection).values({
      id: connectionId,
      customer_id: customerId,
      connector_config_id: 'ccfg_123',
    })

    // Setup Customer 2 and their connection
    await db.insert(schema.customer).values({
      id: otherCustomerId,
      org_id: orgId,
    })

    await db.insert(schema.connection).values({
      id: otherConnectionId,
      customer_id: otherCustomerId,
      connector_config_id: 'ccfg_123',
    })

    // Create token clients
    const tokenResponse = await apiKeyClient.createToken(customerId, {})
    tokenClient = new Openint({
      customerToken: tokenResponse.token,
      baseURL: 'http://localhost/api/v1',
      fetch: appFetch,
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
      const responsePromise = apiKeyClient.getConnection(connectionId)
      const rawResponse = await responsePromise.asResponse()
      expect(rawResponse).toBeInstanceOf(Response)
      const response = await responsePromise
      expect(response).not.toBeInstanceOf(Response)
    })

    describe('top level methods with token auth', () => {
      test('listConnections with token auth', async () => {
        const responsePromise = tokenClient.listConnections()
        const response = await responsePromise
        expect(response).toBeDefined()
        expect(response.items.length).toBe(1)
        expect(response.items[0]?.id).toBe(connectionId)
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
      const connections = await tokenClient.listConnections()
      expect(
        connections.items.find((conn) => conn.id === otherConnectionId),
      ).toBeUndefined()

      await expect(
        tokenClient.getConnection(otherConnectionId),
      ).rejects.toThrow()

      const otherConnections = await otherCustomerClient.listConnections()
      expect(
        otherConnections.items.find((conn) => conn.id === connectionId),
      ).toBeUndefined()

      await expect(
        otherCustomerClient.getConnection(connectionId),
      ).rejects.toThrow()
    }, 10000) // Increase timeout to 10 seconds

    test('customer token should only access own connections', async () => {
      const connections = await tokenClient.listConnections()
      expect(
        connections.items.find((conn) => conn.id === connectionId),
      ).toBeDefined()

      const otherConnections = await otherCustomerClient.listConnections()
      expect(
        otherConnections.items.find((conn) => conn.id === otherConnectionId),
      ).toBeDefined()
    })
  })
})
