import {CustomerId, Viewer} from '@openint/cdk'
import {describeEachDatabase} from '@openint/db/__tests__/test-utils'
import {getTestTRPCClient} from '../../__tests__/test-utils'
import {routerContextFromViewer} from '../context'
import {connectorConfigRouter} from './connectorConfig'

describeEachDatabase({drivers: ['pglite'], migrate: true}, (db) => {
  function getClient(viewer: Viewer) {
    return getTestTRPCClient({db, router: connectorConfigRouter}, viewer)
  }
  function getCaller(viewer: Viewer) {
    return connectorConfigRouter.createCaller(
      routerContextFromViewer({db, viewer}),
    )
  }
  const asOrg = getClient({role: 'org', orgId: 'org_222'})
  const asUser = getClient({
    role: 'user',
    userId: 'user_222',
    orgId: 'org_222',
  })
  const asCustomer = getClient({
    role: 'customer',
    orgId: 'org_222',
    customerId: 'cus_222' as CustomerId,
  })
  const asOtherUser = getClient({
    role: 'user',
    userId: 'user_333',
    orgId: 'org_other',
  })

  // Tests linearly depend on each other for performance and simplicty

  test('create connector config', async () => {
    const res = await asOrg.createConnectorConfig.mutate({
      connector_name: 'qbo',
    })
    expect(res).toEqual({
      id: expect.any(String),
      org_id: 'org_222',
      connector_name: 'qbo',
    })
  })

  test('list connector config', async () => {
    const res = await asOrg.listConnectorConfigs.query()
    expect(res.items).toHaveLength(1)
    expect(res.items[0]?.id).toEqual(expect.any(String))
    expect(res.items[0]?.org_id).toEqual('org_222')
  })

  test('list connector config via caller', async () => {
    const res = await getCaller({
      role: 'org',
      orgId: 'org_222',
    }).listConnectorConfigs()
    expect(res.items).toHaveLength(1)
    expect(res.items[0]?.id).toEqual(expect.any(String))
    expect(res.items[0]?.org_id).toEqual('org_222')
  })

  test('user has access to org connector config', async () => {
    const res = await asUser.listConnectorConfigs.query()
    expect(res.items).toHaveLength(1)
    expect(res.items[0]?.id).toEqual(expect.any(String))
    expect(res.items[0]?.org_id).toEqual('org_222')
  })

  test('customer does not have access to org connector config', async () => {
    await expect(asCustomer.listConnectorConfigs.query()).rejects.toThrow(
      'permission denied',
    )
  })

  test('other user does not have access to org connector config', async () => {
    const res = await asOtherUser.listConnectorConfigs.query()
    expect(res.items).toHaveLength(0)
  })
})
