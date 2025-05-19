import type {Viewer} from '@openint/cdk'

import {makeId} from '@openint/cdk'
import {schema} from '@openint/db'
import {describeEachDatabase} from '@openint/db/__tests__/test-utils'
import {makeUlid} from '@openint/util/id-utils'
import {routerContextFromViewer} from '../context'
import {onError} from '../error-handling'
import {connectorConfigRouter} from './connectorConfig'
import {customerRouter} from './customer'

const logger = false

describeEachDatabase({drivers: ['pglite'], migrate: true, logger}, (db) => {
  function getCusRouterCaller(viewer: Viewer) {
    return customerRouter.createCaller(routerContextFromViewer({db, viewer}), {
      onError,
    })
  }

  function getCcfgRouterCaller(viewer: Viewer) {
    return connectorConfigRouter.createCaller(
      routerContextFromViewer({db, viewer}),
      {onError},
    )
  }

  const asOrgCcfgRouterCaller = getCcfgRouterCaller({
    role: 'org',
    orgId: 'org_222',
  })
  const asOrgCusRouterCaller = getCusRouterCaller({
    role: 'org',
    orgId: 'org_222',
  })

  beforeAll(async () => {
    await db.insert(schema.organization).values({
      id: 'org_222',
      name: 'Test Org',
    })
    const ccfg = await asOrgCcfgRouterCaller.createConnectorConfig({
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
    const res = await asOrgCusRouterCaller.listCustomers()

    expect(res.items).toHaveLength(1)
    expect(res.items[0]?.connection_count).toEqual(1)
  })

  test('list customers with existing search query', async () => {
    const res = await asOrgCusRouterCaller.listCustomers({
      search_query: 'cus_222',
    })

    expect(res.items).toHaveLength(1)
  })

  test('list customers with non existing search query', async () => {
    const res = await asOrgCusRouterCaller.listCustomers({
      search_query: 'cus_333',
    })

    expect(res.items).toHaveLength(0)
  })

  describe('upsertCustomer', () => {
    test('creates a new customer when id does not exist', async () => {
      const metadata = {name: 'Test Customer', email: 'test@example.com'}
      const customer = await asOrgCusRouterCaller.upsertCustomer({
        id: 'cus_333',
        metadata,
      })

      expect(customer).toMatchObject({
        id: 'cus_333',
        org_id: 'org_222',
        metadata,
      })
      expect(customer.api_key).toMatch(/^key_cus_/)
    })

    test('updates existing customer when id exists', async () => {
      const initialMetadata = {name: 'Initial Name'}
      const updatedMetadata = {
        name: 'Updated Name',
        email: 'updated@example.com',
      }

      // First create the customer
      const initialCustomer = await asOrgCusRouterCaller.upsertCustomer({
        id: 'cus_444',
        metadata: initialMetadata,
      })

      // Then update it
      const updatedCustomer = await asOrgCusRouterCaller.upsertCustomer({
        id: 'cus_444',
        metadata: updatedMetadata,
      })

      expect(updatedCustomer).toMatchObject({
        id: 'cus_444',
        org_id: 'org_222',
        metadata: updatedMetadata,
      })
      // API key should be preserved
      expect(updatedCustomer.api_key).toBe(initialCustomer.api_key)
    })

    test('creates customer with auto-generated id when not provided', async () => {
      const customer = await asOrgCusRouterCaller.upsertCustomer({
        metadata: {name: 'Auto ID Customer'},
      })

      expect(customer.id).toMatch(/^cus_/)
      expect(customer.org_id).toBe('org_222')
      expect(customer.metadata).toEqual({name: 'Auto ID Customer'})
      expect(customer.api_key).toMatch(/^key_cus_/)
    })
  })
})
