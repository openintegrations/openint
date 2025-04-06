import type {CustomerId, Viewer} from '@openint/cdk'
import {schema} from '@openint/db'
import {describeEachDatabase} from '@openint/db/__tests__/test-utils'
import {initDbPGLite} from '@openint/db/db.pglite'
import {makeUlid} from '@openint/util/id-utils'
import {createTRPCCaller} from '../handlers'
import {getTestTRPCClient} from './test-utils'

const viewers = {
  anon: {role: 'anon'},
  user: {role: 'user', userId: 'user_123', orgId: 'org_123'},
  org: {role: 'org', orgId: 'org_123'},
  customer: {
    role: 'customer',
    orgId: 'org_123',
    customerId: 'cus_123' as CustomerId,
  },
} satisfies Record<string, Viewer>

jest.setTimeout(15_000)

describe('authentication', () => {
  // Important to ensure we always close the database otherwise jest flakiness can cause test failures...
  const db = initDbPGLite()

  afterAll(async () => {
    await db.$end()
  })

  test.each(Object.entries(viewers))('via jwt as %s', async (_desc, viewer) => {
    const client = getTestTRPCClient({db}, viewer)
    const res = await client.viewer.query()
    expect(res.role).toEqual(viewer.role)

    const caller = createTRPCCaller({db}, viewer)
    const res2 = await caller.viewer()
    expect(res2.role).toEqual(viewer.role)
  })
})

describeEachDatabase({drivers: ['pglite'], migrate: true}, (db) => {
  function getClient(viewerOrKey: Viewer | {api_key: string}) {
    return getTestTRPCClient({db}, viewerOrKey)
  }
  function getCaller(viewer: Viewer) {
    return createTRPCCaller({db}, viewer)
  }

  const apiKey = `key_${makeUlid()}`

  beforeAll(async () => {
    const client = getClient({role: 'org', orgId: 'org_123'})
    await db.$truncateAll()

    await db.insert(schema.organization).values({
      id: 'org_123',
      api_key: apiKey,
    })
    await client.createConnectorConfig.mutate({
      connector_name: 'quickbooks',
      config: {
        oauth: {client_id: 'client_123', client_secret: 'xxx'},
        envName: 'sandbox',
      },
    })
  })

  test('apikey auth success', async () => {
    const client = getTestTRPCClient({db}, {api_key: apiKey})
    const res = await client.viewer.query()
    expect(res).toMatchObject({role: 'org'})
  })

  test('apikey auth failure', async () => {
    const client = getTestTRPCClient({db}, {api_key: 'key_badddd'})
    await expect(client.viewer.query()).rejects.toThrow('Invalid API key')
  })

  test('anon user has no access to connector_config', async () => {
    await expect(
      getClient({role: 'anon'}).listConnectorConfigs.query(),
    ).rejects.toThrow('Authentication required')
    await expect(
      getCaller({role: 'anon'}).listConnectorConfigs(),
    ).rejects.toThrow('Authentication required')
  })

  test('org has access to its own connector config', async () => {
    const client = getClient({role: 'org', orgId: 'org_123'})
    const res = await client.listConnectorConfigs.query()
    expect(res.items).toHaveLength(1)
    expect(res.items[0]?.id).toMatch(/^ccfg_quickbooks_/)

    const caller = getCaller({role: 'org', orgId: 'org_123'})
    const res2 = await caller.listConnectorConfigs()
    expect(res2.items).toHaveLength(1)
    expect(res2.items[0]?.id).toMatch(/^ccfg_quickbooks_/)
  })

  test('org has no access to other orgs connector config', async () => {
    const client = getClient({role: 'org', orgId: 'org_456'})
    const res = await client.listConnectorConfigs.query()
    expect(res.items).toHaveLength(0)

    const caller = getCaller({role: 'org', orgId: 'org_456'})
    const res2 = await caller.listConnectorConfigs()
    expect(res2.items).toHaveLength(0)
  })
})
