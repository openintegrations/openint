import type {CustomerId, Viewer} from '@openint/cdk'
import {schema} from '@openint/db'
import {describeEachDatabase} from '@openint/db/__tests__/test-utils'
import {initDbPGLite} from '@openint/db/db.pglite'
import {createTRPCCaller} from '../trpc/handlers'
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

test.each(Object.entries(viewers))(
  'authenticating as %s',
  async (_desc, viewer) => {
    const client = getTestTRPCClient({db: initDbPGLite()}, viewer)
    const res = await client.viewer.query()
    expect(res).toEqual(viewer ?? {role: 'anon'})

    const caller = createTRPCCaller({db: initDbPGLite()}, viewer)
    const res2 = await caller.viewer()
    expect(res2).toEqual(viewer ?? {role: 'anon'})
  },
)

describeEachDatabase({drivers: 'rls', migrate: true}, (db) => {
  function getClient(viewer: Viewer) {
    return getTestTRPCClient({db}, viewer)
  }
  function getCaller(viewer: Viewer) {
    return createTRPCCaller({db}, viewer)
  }

  beforeAll(async () => {
    await db.$truncateAll()
    await db
      .insert(schema.connector_config)
      .values({org_id: 'org_123', id: 'ccfg_123'})
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
    expect(res.items[0]?.id).toEqual('ccfg_123')

    const caller = getCaller({role: 'org', orgId: 'org_123'})
    const res2 = await caller.listConnectorConfigs()
    expect(res2.items).toHaveLength(1)
    expect(res2.items[0]?.id).toEqual('ccfg_123')
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
