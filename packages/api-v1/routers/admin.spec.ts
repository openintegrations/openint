import type {Viewer} from '@openint/cdk'
import {schema} from '@openint/db'
import {describeEachDatabase} from '@openint/db/__tests__/test-utils'
import {routerContextFromViewer} from '../trpc/context'
import {adminRouter} from './admin'

const logger = false

describeEachDatabase({drivers: ['pglite'], migrate: true, logger}, (db) => {
  beforeAll(async () => {
    await db.insert(schema.organization).values({
      id: 'org_222',
      name: 'Test Org',
    })
    await db.insert(schema.customer).values({
      id: 'cus_222',
      org_id: 'org_222',
      metadata: {},
    })
  })

  function getCaller(viewer: Viewer) {
    return adminRouter.createCaller(routerContextFromViewer({db, viewer}))
  }

  const asAdmin = getCaller({role: 'system'})

  test('list customers', async () => {
    const res = await asAdmin.listCustomers()
    expect(res.items).toHaveLength(1)
    expect(res.items[0]?.org_id).toEqual('org_222')
    expect(res.items[0]?.connection_count).toEqual(0)
  })
})
