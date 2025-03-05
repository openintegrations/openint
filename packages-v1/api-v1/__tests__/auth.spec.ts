import type {CustomerId, Viewer} from '@openint/cdk'
import {schema} from '@openint/db'
import {describeEachDatabase} from '@openint/db/__tests__/test-utils'
import {initDbPGLite} from '@openint/db/db.pglite'
import {getTrpcClient} from './test-utils'

const viewers = {
  anon: null,
  user: {role: 'user', userId: 'user_123', orgId: 'org_123'},
  org: {role: 'org', orgId: 'org_123'},
  customer: {
    role: 'customer',
    orgId: 'org_123',
    customerId: 'cus_123' as CustomerId,
  },
} satisfies Record<string, Viewer | null>

test.each(Object.entries(viewers))(
  'authenticating as %s',
  async (_desc, viewer) => {
    const client = getTrpcClient(initDbPGLite({}), viewer)
    const res = await client.viewer.query()
    expect(res).toEqual(viewer ?? {role: 'anon'})
  },
)

describeEachDatabase({drivers: ['pglite'], migrate: true}, (db) => {
  test('anon user has no access to connector_config', async () => {
    await expect(
      getTrpcClient(db, null).listConnectorConfigs.query(),
    ).rejects.toThrow('Admin only')
  })

  beforeAll(async () => {
    await db.$truncateAll()
    await db
      .insert(schema.connector_config)
      .values({org_id: 'org_123', id: 'ccfg_123'})
  })

  test('org has access to its own connector config', async () => {
    const client = getTrpcClient(db, {role: 'org', orgId: 'org_123'})
    const res = await client.listConnectorConfigs.query()
    expect(res.items).toHaveLength(1)
    expect(res.items[0]?.id).toEqual('ccfg_123')
  })

  test('org has no access to other orgs connector config', async () => {
    const client = getTrpcClient(db, {role: 'org', orgId: 'org_456'})
    const res = await client.listConnectorConfigs.query()
    expect(res.items).toHaveLength(0)
  })
})
