import {makeId, type Viewer} from '@openint/cdk'
import {schema} from '@openint/db'
import {describeEachDatabase} from '@openint/db/__tests__/test-utils'
import {makeUlid} from '@openint/util'
import {routerContextFromViewer} from '../trpc/context'
import {onError} from '../trpc/error-handling'
import {connectorConfigRouter} from './connectorConfig'
import {customerRouter} from './customer'

const logger = false

describeEachDatabase({drivers: ['pglite'], migrate: true, logger}, (db) => {
  function getCustomerCaller(viewer: Viewer) {
    return customerRouter.createCaller(routerContextFromViewer({db, viewer}), {
      onError,
    })
  }

  function getCcfgCaller(viewer: Viewer) {
    return connectorConfigRouter.createCaller(
      routerContextFromViewer({db, viewer}),
      {onError},
    )
  }

  const asOrgCcfgCaller = getCcfgCaller({role: 'org', orgId: 'org_222'})
  const asOrgConnectionsCaller = getCustomerCaller({
    role: 'org',
    orgId: 'org_222',
  })

  beforeAll(async () => {
    await db.insert(schema.organization).values({
      id: 'org_222',
      name: 'Test Org',
    })
    const ccfg = await asOrgCcfgCaller.createConnectorConfig({
      connector_name: 'quickbooks',
      config: {
        oauth: {client_id: 'client_222', client_secret: 'xxx'},
        envName: 'sandbox',
      },
    })
    await db.insert(schema.connection).values({
      id: makeId('conn', 'quickbooks', makeUlid()),
      customer_id: 'cus_222',
      connector_config_id: ccfg.id,
      metadata: {},
    })
  })

  test('list customers', async () => {
    const res = await asOrgConnectionsCaller.listCustomers()

    expect(res.items).toHaveLength(1)
    expect(res.items[0]?.connection_count).toEqual(1)
  })

  test('list customers with existing keywords', async () => {
    const res = await asOrgConnectionsCaller.listCustomers({
      keywords: 'cus_222',
    })

    expect(res.items).toHaveLength(1)
  })

  test('list customers with non existing keywords', async () => {
    const res = await asOrgConnectionsCaller.listCustomers({
      keywords: 'cus_333',
    })

    expect(res.items).toHaveLength(0)
  })
})
