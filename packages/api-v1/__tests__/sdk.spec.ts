import {schema} from '@openint/db'
import {describeEachDatabase} from '@openint/db/__tests__/test-utils'
import Openint from '@openint/sdk'
import {makeUlid} from '@openint/util/id-utils'
import {createApp} from '../app'

describeEachDatabase({drivers: ['pglite'], migrate: true}, (db) => {
  const app = createApp({db})
  const appFetch = (input: RequestInfo | URL, init?: RequestInit) => {
    const request = new Request(input, init)
    return app.handle(request)
  }

  const orgId = 'org_123'
  const apiKey = `key_${makeUlid()}`
  const customerId = 'cus_123'

  const apiKeyClient = new Openint({
    apiKey,
    baseURL: 'http://localhost/v1',
    fetch: appFetch,
  })

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
  })

  describe('authentication tests with viewer endpoint', () => {
    test('API key client should authenticate as org', async () => {
      const response = await apiKeyClient.getCurrentUser()
      expect(response.role).toBe('org')
    })

    test('wrong API key should fail authentication', async () => {
      const wrongApiKey = `key_${makeUlid()}`
      const wrongApiKeyClient = new Openint({
        apiKey: wrongApiKey,
        baseURL: 'http://localhost/v1',
        fetch: appFetch,
      })

      await expect(wrongApiKeyClient.getCurrentUser()).rejects.toThrow()
    })

    test('customer token client should authenticate as customer', async () => {
      const tokenResponse = await apiKeyClient.createToken(customerId, {})
      const tokenClient = new Openint({
        customerToken: tokenResponse.token,
        baseURL: 'http://localhost/v1',
        fetch: appFetch,
      })
      const response = await tokenClient.getCurrentUser()
      expect(response.role).toBe('customer')
    })

    test('wrong token should fail authentication', async () => {
      const wrongToken = `token_${makeUlid()}`
      const wrongTokenClient = new Openint({
        customerToken: wrongToken,
        baseURL: 'http://localhost/v1',
        fetch: appFetch,
      })

      await expect(wrongTokenClient.getCurrentUser()).rejects.toThrow()
    })
  })
})
