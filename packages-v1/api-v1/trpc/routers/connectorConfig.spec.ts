import type {CustomerId, Viewer} from '@openint/cdk'
import {describeEachDatabase} from '@openint/db/__tests__/test-utils'
import {getTestTRPCClient} from '../../__tests__/test-utils'
import {routerContextFromViewer} from '../context'
import {connectorConfigRouter} from './connectorConfig'

const logger = false

describeEachDatabase({drivers: ['pglite'], migrate: true, logger}, (db) => {
  /** Preferred approach */
  function getCaller(viewer: Viewer) {
    return connectorConfigRouter.createCaller(
      routerContextFromViewer({db, viewer}),
    )
  }
  /** Also possible */
  function getClient(viewer: Viewer) {
    return getTestTRPCClient({db, router: connectorConfigRouter}, viewer)
  }
  const asOrg = getCaller({role: 'org', orgId: 'org_222'})
  const asUser = getCaller({
    role: 'user',
    userId: 'user_222',
    orgId: 'org_222',
  })
  const asCustomer = getCaller({
    role: 'customer',
    orgId: 'org_222',
    customerId: 'cus_222' as CustomerId,
  })
  const asOtherUser = getCaller({
    role: 'user',
    userId: 'user_333',
    orgId: 'org_other',
  })

  // Tests linearly depend on each other for performance and simplicty

  test('create connector config', async () => {
    const res = await asOrg.createConnectorConfig({
      connector_name: 'qbo',
    })
    expect(res).toEqual({
      id: expect.any(String),
      org_id: 'org_222',
      connector_name: 'qbo',
    })
  })

  test('list connector config', async () => {
    const res = await asOrg.listConnectorConfigs()
    expect(res.items).toHaveLength(1)
    expect(res.items[0]?.id).toEqual(expect.any(String))
    expect(res.items[0]?.org_id).toEqual('org_222')
    expect(res.total).toEqual(1)
  })

  test('list connector config via custom client', async () => {
    const res = await getClient({
      role: 'org',
      orgId: 'org_222',
    }).listConnectorConfigs.query()
    expect(res.items).toHaveLength(1)
    expect(res.items[0]?.id).toEqual(expect.any(String))
    expect(res.items[0]?.org_id).toEqual('org_222')
  })

  test('user has access to org connector config', async () => {
    const res = await asUser.listConnectorConfigs()
    expect(res.items).toHaveLength(1)
    expect(res.items[0]?.id).toEqual(expect.any(String))
    expect(res.items[0]?.org_id).toEqual('org_222')
  })

  test('customer does not have access to org connector config', async () => {
    await expect(asCustomer.listConnectorConfigs()).rejects.toThrow(
      'permission denied',
    )
  })

  test('other user does not have access to org connector config', async () => {
    const res = await asOtherUser.listConnectorConfigs()
    expect(res.items).toHaveLength(0)
  })
})
