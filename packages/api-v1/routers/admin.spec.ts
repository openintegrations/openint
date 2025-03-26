import {makeId, type Viewer} from '@openint/cdk'
import {schema} from '@openint/db'
import {describeEachDatabase} from '@openint/db/__tests__/test-utils'
import {makeUlid} from '@openint/util'
import {routerContextFromViewer} from '../trpc/context'
import {adminRouter} from './admin'
import {connectorConfigRouter} from './connectorConfig'

const logger = false

describeEachDatabase({drivers: ['pglite'], migrate: true, logger}, (db) => {
  function getCaller(viewer: Viewer) {
    return adminRouter.createCaller(routerContextFromViewer({db, viewer}))
  }

  function getCcfgCaller(viewer: Viewer) {
    return connectorConfigRouter.createCaller(
      routerContextFromViewer({db, viewer}),
    )
  }

  const asOrg = getCcfgCaller({role: 'org', orgId: 'org_222'})
  const asAdmin = getCaller({role: 'system'})

  beforeAll(async () => {
    await db.insert(schema.organization).values({
      id: 'org_222',
      name: 'Test Org',
    })
    const ccfg = await asOrg.createConnectorConfig({
      connector_name: 'qbo',
      config: {
        oauth: {client_id: 'client_222', client_secret: 'xxx'},
        envName: 'sandbox',
      },
    })
    await db.insert(schema.connection).values({
      id: makeId('conn', 'qbo', makeUlid()),
      customer_id: 'cus_222',
      connector_config_id: ccfg.id,
      metadata: {},
    })
  })

  test('list customers', async () => {
    const res = await asAdmin.listCustomers()

    expect(res.items).toHaveLength(1)
    expect(res.items[0]?.connection_count).toEqual(1)
  })
})
