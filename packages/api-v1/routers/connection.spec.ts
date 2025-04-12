import type {CustomerId, Viewer} from '@openint/cdk'

import {makeId} from '@openint/cdk'
import {schema, sql} from '@openint/db'
import {describeEachDatabase} from '@openint/db/__tests__/test-utils'
import {$test} from '@openint/util/__tests__/test-utils'
import {makeUlid} from '@openint/util/id-utils'
import {routerContextFromViewer} from '../trpc/context'
import {onError} from '../trpc/error-handling'
import {connectionRouter} from './connection'

// TODO: Fix standalone expect calls

const logger = false

describeEachDatabase({drivers: ['pglite'], migrate: true, logger}, (db) => {
  function getTestContext<T extends Viewer>(viewer: T) {
    const ctx = routerContextFromViewer<T>({db, viewer})
    const caller = connectionRouter.createCaller(ctx, {onError})
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
        total: sql`count(*) OVER ()`,
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

    const conns = await asCustomer.caller.listConnections({
      // TODO: @openint-bot, add tests for include_secrets cases
      include_secrets: 'all',
    })
    expect(conns.items).toHaveLength(1)
    expect(conns.items[0]).toMatchObject({
      id: connIdRef.current,
      connector_config_id: connConfigIdRef.current,
    })
  })

  test('other customer also finds own connection', async () => {
    const res = await asOtherCustomer.db.query.connection.findMany()
    expect(res).toHaveLength(1)
    expect(res[0]).toMatchObject({
      id: otherConnIdRef.current,
      connector_config_id: connConfigIdRef.current,
      customer_id: asOtherCustomer.viewer.customerId,
    })
  })

  test('delete connection', async () => {
    const res = await asOrg.caller.deleteConnection({
      id: connIdRef.current,
    })

    expect(res).toEqual({id: connIdRef.current})
  })

  test('delete connection with invalid id returns error', async () => {
    await expect(
      asOrg.caller.deleteConnection({
        id: 'conn_invalid',
      }),
    ).rejects.toThrow('not found')
  })

  describe('create connection', () => {
    test('with valid settings', async () => {
      const connectorConfigId = makeId('ccfg', 'greenhouse', makeUlid())

      // First create the connector config
      await asOrg.db
        .insert(schema.connector_config)
        .values({
          id: connectorConfigId,
          org_id: asOrg.viewer.orgId,
        })
        .returning()

      const connection = await asOrg.caller.createConnection({
        connector_config_id: connectorConfigId,
        customer_id: asOrg.viewer.orgId,
        data: {
          connector_name: 'greenhouse',
          settings: {
            apiKey: 'test_api_key',
          },
        },
      })

      expect(connection).toMatchObject({
        connector_name: 'greenhouse',
        connector_config_id: connectorConfigId,
        customer_id: asOrg.viewer.orgId,
        settings: {
          apiKey: 'test_api_key',
        },
      })
    })

    test('fails with non-existent connector config', async () => {
      const nonExistentConfigId = makeId('ccfg', 'greenhouse', makeUlid())

      await expect(
        asOrg.caller.createConnection({
          connector_config_id: nonExistentConfigId,
          customer_id: asOrg.viewer.orgId,
          data: {
            connector_name: 'greenhouse',
            settings: {
              apiKey: 'test_api_key',
            },
          },
        }),
      ).rejects.toThrow('not found')
    })

    test('fails with mismatched connector names', async () => {
      const connectorConfigId = makeId('ccfg', 'greenhouse', makeUlid())

      // Create connector config for greenhouse
      await asOrg.db
        .insert(schema.connector_config)
        .values({
          id: connectorConfigId,
          org_id: asOrg.viewer.orgId,
        })
        .returning()

      // Try to create connection with different connector name
      await expect(
        asOrg.caller.createConnection({
          connector_config_id: connectorConfigId,
          customer_id: asOrg.viewer.orgId,
          data: {
            connector_name: 'hubspot', // Different from connector_config
            settings: {
              apiKey: 'test_api_key',
            },
          },
        }),
      ).rejects.toThrow('Input validation failed')
    })

    test('with metadata', async () => {
      const connectorConfigId = makeId('ccfg', 'greenhouse', makeUlid())

      await asOrg.db
        .insert(schema.connector_config)
        .values({
          id: connectorConfigId,
          org_id: asOrg.viewer.orgId,
        })
        .returning()

      const metadata = {
        companyName: 'Test Corp',
        region: 'US',
      }

      const connection = await asOrg.caller.createConnection({
        connector_config_id: connectorConfigId,
        metadata,
        data: {
          connector_name: 'greenhouse',
          settings: {
            apiKey: 'test_api_key',
          },
        },
        customer_id: asOrg.viewer.orgId,
      })

      expect(connection).toMatchObject({
        connector_name: 'greenhouse',
        connector_config_id: connectorConfigId,
        metadata,
        customer_id: asOrg.viewer.orgId,
      })
    })

    test('with invalid settings fails', async () => {
      const connectorConfigId = makeId('ccfg', 'greenhouse', makeUlid())

      await asOrg.db
        .insert(schema.connector_config)
        .values({
          id: connectorConfigId,
          org_id: asOrg.viewer.orgId,
        })
        .returning()

      // Try to create connection with invalid settings
      await expect(
        asOrg.caller.createConnection({
          connector_config_id: connectorConfigId,
          data: {
            connector_name: 'greenhouse',
            settings: {
              // Missing required apiKey
              environment: 'sandbox',
            },
          },
          customer_id: asOrg.viewer.orgId,
        }),
      ).rejects.toThrow()
    })
  })
})
