// TODO: Fix standalone expect calls
/* eslint-disable jest/no-standalone-expect */
import {makeId, type CustomerId, type Viewer} from '@openint/cdk'
import {schema} from '@openint/db'
import {describeEachDatabase} from '@openint/db/__tests__/test-utils'
import {makeUlid} from '@openint/util'
import {$test} from '@openint/util/__tests__/test-utils'
import {routerContextFromViewer} from '../context'
import {connectionRouter} from './connection'

const logger = false

describeEachDatabase({drivers: ['pglite'], migrate: true, logger}, (db) => {
  function getTestContext<T extends Viewer>(viewer: T) {
    const ctx = routerContextFromViewer<T>({db, viewer})
    const caller = connectionRouter.createCaller(ctx)
    return {...ctx, caller}
  }

  const asOrg = getTestContext({role: 'org', orgId: 'org_222'})
  const asUser = getTestContext({
    role: 'user',
    userId: 'user_222',
    orgId: 'org_222',
  })
  const asCustomer = getTestContext({
    role: 'customer',
    orgId: asOrg.viewer.orgId,
    customerId: 'cus_222' as CustomerId,
  })
  const asOtherCustomer = getTestContext({
    role: 'customer',
    orgId: 'org_222',
    customerId: 'cus_333' as CustomerId,
  })

  // Tests linearly depend on each other for performance and simplicty

  const connConfigIdRef = $test('user create connector config', async () => {
    const res = await asUser.db
      .insert(schema.connector_config)
      .values({
        id: makeId('ccfg', 'qbo', makeUlid()),
        org_id: asUser.viewer.orgId,
      })
      .returning()

    expect(res[0]).toMatchObject({
      id: expect.any(String),
      org_id: asUser.viewer.orgId,
      connector_name: 'qbo',
    })
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return res[0]!.id
  })

  // Customers not allowed to create just yet...
  const connIdRef = $test('org creates connection for customer', async () => {
    const res = await asOrg.db
      .insert(schema.connection)
      .values({
        connector_config_id: connConfigIdRef.current,
        customer_id: asCustomer.viewer.customerId,
      })
      .returning()
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return res[0]!.id
  })

  test('find own connection', async () => {
    const res = await asCustomer.db.query.connection.findMany()
    expect(res[0]).toMatchObject({
      id: connIdRef.current,
      connector_config_id: connConfigIdRef.current,
      customer_id: 'cus_222',
    })

    // @pellicceama this is failing due to
    //     error: column "connection.id" must appear in the GROUP BY clause or be used in an aggregate function
    // const conns = await asCustomer.caller.listConnections()
    // console.log(conns)
  })

  test('does not find other customer connection', async () => {
    const res = await asOtherCustomer.db.query.connection.findMany()
    expect(res).toEqual([])
  })
})
