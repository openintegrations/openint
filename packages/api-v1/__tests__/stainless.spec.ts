import {beforeAll, describe, expect, test} from '@jest/globals'
import {CustomerId} from '@openint/cdk'
import {schema} from '@openint/db'
import {describeEachDatabase} from '@openint/db/__tests__/test-utils'
import {envRequired} from '@openint/env'
import Openint from '@openint/sdk'
import {makeUlid} from '@openint/util/id-utils'
import {createApp} from '../app'
import {makeJwtClient} from '../lib/makeJwtClient'

describeEachDatabase({drivers: ['pglite'], migrate: true}, (db) => {
  const app = createApp({db})
  const appFetch = (input: RequestInfo | URL, init?: RequestInit) => {
    const request = new Request(input, init)
    return app.handle(request)
  }

  const orgId = 'org_123'
  const apiKey = `key_${makeUlid()}`
  const customerApiKey = `key_cus_${makeUlid()}`
  const customerId = 'cus_123'

  const apiKeyClient = new Openint({
    token: apiKey,
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
      api_key: customerApiKey,
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
        token: wrongApiKey,
        baseURL: 'http://localhost/v1',
        fetch: appFetch,
      })

      await expect(wrongApiKeyClient.getCurrentUser()).rejects.toThrow()
    })

    test('client should authenticate as customer with a customer token', async () => {
      const jwt = makeJwtClient({secretOrPublicKey: envRequired.JWT_SECRET})

      const token = await jwt.signToken(
        {
          role: 'customer',
          customerId: customerId as CustomerId,
          orgId,
        },
        {
          validityInSeconds: 1000,
        },
      )

      // console.log('tokenResponse', tokenResponse)
      const tokenClient = new Openint({
        token,
        baseURL: 'http://localhost/v1',
        fetch: appFetch,
      })
      const response = await tokenClient.getCurrentUser()
      expect(response.role).toBe('customer')
    })

    test('client should authenticate as customer with an api key', async () => {
      // console.log('tokenResponse', tokenResponse)
      const tokenClient = new Openint({
        token: customerApiKey,
        baseURL: 'http://localhost/v1',
        fetch: appFetch,
      })
      const response = await tokenClient.getCurrentUser()
      expect(response.role).toBe('customer')
    })

    test('wrong token should fail authentication', async () => {
      const wrongToken = `token_${makeUlid()}`
      const wrongTokenClient = new Openint({
        token: wrongToken,
        baseURL: 'http://localhost/v1',
        fetch: appFetch,
      })

      await expect(wrongTokenClient.getCurrentUser()).rejects.toThrow()
    })

    test('enum string array should work', async () => {
      const baseUrl = 'http://localhost/v1'
      const assertFetchSdk = new Openint({
        token: apiKey,
        baseURL: baseUrl,
        fetch: (input) => {
          const urlString =
            input instanceof Request ? input.url : input.toString()
          const url = new URL(urlString)
          // ideally the SDK would support
          // connector_names=greenhouse&connector_names=acme-oauth2
          // but it doesn't, so we need to support this
          // format ourselves
          expect(url.searchParams.getAll('connector_names')).toEqual([
            'greenhouse,acme-oauth2',
          ])
          expect(urlString).toBe(
            `${baseUrl}/connection?connector_names=greenhouse%2Cacme-oauth2`,
          )
          // return a response to avoid actual network call
          return Promise.resolve(new Response())
        },
      })

      await assertFetchSdk.listConnections({
        connector_names: ['greenhouse', 'acme-oauth2'],
      })
    })
  })
})
