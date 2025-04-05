import type {CustomerId, Viewer} from '@openint/cdk'
import {oauth2Schemas} from '@openint/cnext/_defaults/oauth2/def'
import {describeEachDatabase} from '@openint/db/__tests__/test-utils'
import {$test} from '@openint/util/__tests__/test-utils'
import {getTestTRPCClient} from '../__tests__/test-utils'
import {trpc} from '../trpc/_base'
import {routerContextFromViewer} from '../trpc/context'
import {onError} from '../trpc/error-handling'
import {connectRouter} from './connect'
import {connectionRouter} from './connection'
import {connectorConfigRouter} from './connectorConfig'
import {customerRouter} from './customer'
import {eventRouter} from './event'

const logger = false

const router = trpc.mergeRouters(
  connectorConfigRouter,
  connectRouter,
  connectionRouter,
  eventRouter,
  customerRouter,
)

describeEachDatabase({drivers: ['pglite'], migrate: true, logger}, (db) => {
  /** Preferred approach */
  function getCaller(viewer: Viewer) {
    return router.createCaller(routerContextFromViewer({db, viewer}), {onError})
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
  // Tests linearly depend on each other for performance and simplicty

  const ccfgRes = $test('create connector config', async () => {
    const res = await asUser.createConnectorConfig({
      connector_name: 'dummy-oauth2',
      config: {
        oauth: {client_id: 'client_222', client_secret: 'xxx'},
      },
    })

    expect(res).toMatchObject({
      id: expect.any(String),
      org_id: 'org_222',
      connector_name: 'dummy-oauth2',
    })
    return res
  })

  const preConnectRes = $test('preConnect', async () => {
    const res = await asCustomer.preConnect({
      id: ccfgRes.current.id,
      options: {},
      data: {
        connector_name: ccfgRes.current.connector_name,
        input: {},
      },
    })
    return oauth2Schemas.connectInput.parse(res.output)
  })
})
