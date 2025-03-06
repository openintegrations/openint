// TODO: Fix standalone expect calls
/* eslint-disable jest/no-standalone-expect */
import {makeId, type CustomerId, type Viewer} from '@openint/cdk'
import {schema, sql} from '@openint/db'
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
        id: makeId('ccfg', 'greenhouse', makeUlid()),
        org_id: asUser.viewer.orgId,
      })
      .returning()

    expect(res[0]).toMatchObject({
      id: expect.any(String),
      org_id: asUser.viewer.orgId,
      connector_name: 'greenhouse',
    })
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return res[0]!.id
  })

  // Customers not allowed to create just yet...
  const connIdRef = $test('org creates connection for customer', async () => {
    const res = await asOrg.db
      .insert(schema.connection)
      .values({
        // TODO: Add check to make sure id format is respected for connection ids
        id: makeId('conn', 'greenhouse', makeUlid()),
        connector_config_id: connConfigIdRef.current,
        customer_id: asCustomer.viewer.customerId,
        settings: {apiKey: ''},
      })
      .returning()
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return res[0]!.id
  })

  const otherConnIdRef = $test(
    'org creates connection for other customer',
    async () => {
      const res = await asOrg.db
        .insert(schema.connection)
        .values({
          id: makeId('conn', 'greenhouse', makeUlid()),
          connector_config_id: connConfigIdRef.current,
          customer_id: asOtherCustomer.viewer.customerId,
          settings: {apiKey: ''},
        })
        .returning()
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      return res[0]!.id
    },
  )

  test('window function query works', async () => {
    const res = await asCustomer.db
      .select({
        connection: schema.connection,
        total: sql`count(*) over ()`,
      })
      .from(schema.connection)
    expect(res[0]?.total).toEqual(1)
    expect(res[0]?.connection).toMatchObject({
      id: connIdRef.current,
      connector_config_id: connConfigIdRef.current,
      customer_id: asCustomer.viewer.customerId,
    })
  })

  test('find own connection', async () => {
    // direct db access
    const res = await asCustomer.db.query.connection.findMany()
    expect(res).toHaveLength(1)
    expect(res[0]).toMatchObject({
      id: connIdRef.current,
      connector_config_id: connConfigIdRef.current,
      customer_id: asCustomer.viewer.customerId,
    })

    // Via trpc
    const conns = await asCustomer.caller.listConnections()
    expect(conns.items).toHaveLength(1)
    expect(conns.items[0]).toMatchObject({
      id: connIdRef.current,
      connector_config_id: connConfigIdRef.current,
    })
  })

  test('does not find other customer connection', async () => {
    const res = await asOtherCustomer.db.query.connection.findMany()
    expect(res).toHaveLength(1)
    expect(res[0]).toMatchObject({
      id: otherConnIdRef.current,
      connector_config_id: connConfigIdRef.current,
      customer_id: asOtherCustomer.viewer.customerId,
    })
  })
})
