import type {ConnectorServer, CustomerId, Viewer} from '@openint/cdk'
import type {RouterContext} from '../../context'

import {
  afterEach,
  beforeEach,
  describe,
  expect,
  jest,
  test,
} from '@jest/globals'
import {TRPCError} from '@trpc/server'
import {serverConnectors} from '@openint/all-connectors/connectors.server'
import {makeId} from '@openint/cdk'
import {eq, schema} from '@openint/db'
import {describeEachDatabase} from '@openint/db/__tests__/test-utils'
import {Z} from '@openint/util/zod-utils'
import {core} from '../../../models'
import {routerContextFromViewer} from '../../context'
import {checkConnection, connectionExpired} from './connectionChecker'

// Mocks for functions used *within* checkConnection, but keep connectors themselves mostly real
jest.mock('@openint/env', () => ({
  getBaseURLs: jest.fn().mockReturnValue({api: '', console: '', connect: ''}),
}))
jest.mock('../../../lib/typed-routes', () => ({
  getApiV1URL: jest.fn().mockReturnValue(''),
}))
// Mock the actual connector implementations partially
jest.mock('@openint/all-connectors/connectors.server')

// --- Unit tests for connectionExpired (no DB needed) ---
describe('connectionExpired', () => {
  // Helper for connectionExpired tests
  const createConnForExpiry = (
    overrides: Partial<Z.infer<typeof core.connection_select>> = {},
  ): Z.infer<typeof core.connection_select> => ({
    id: 'conn_test123',
    connector_name: 'test',
    connector_config_id: 'ccfg_test123',
    customer_id: 'cus_test123' as CustomerId,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    status: null,
    status_message: null,
    settings: {},
    metadata: null,
    disabled: false,
    display_name: null,
    integration_id: null,
    ...overrides,
  })

  test('should return true for expired OAuth credentials', () => {
    const expiredConnection = createConnForExpiry({
      settings: {
        oauth: {
          credentials: {
            access_token: 'expired_token',
            expires_at: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
          },
        },
      },
    })
    expect(connectionExpired(expiredConnection)).toBe(true)
  })

  test('should return false for valid OAuth credentials', () => {
    const validConnection = createConnForExpiry({
      settings: {
        oauth: {
          credentials: {
            access_token: 'valid_token',
            expires_at: new Date(Date.now() + 1000 * 60 * 60).toISOString(),
          },
        },
      },
    })
    expect(connectionExpired(validConnection)).toBe(false)
  })

  test('should return false for missing expires_at', () => {
    const connectionNoExpiry = createConnForExpiry({
      settings: {
        oauth: {
          credentials: {access_token: 'token_no_expiry'},
        },
      },
    })
    expect(connectionExpired(connectionNoExpiry)).toBe(false)
  })

  test('should return false for non-OAuth connection', () => {
    const nonOauthConnection = createConnForExpiry({
      settings: {apiKey: 'some_key'},
    })
    expect(connectionExpired(nonOauthConnection)).toBe(false)
  })

  test('should return false for missing credentials', () => {
    const missingCredsConnection = createConnForExpiry({
      settings: {oauth: {}}, // Missing credentials
    })
    expect(connectionExpired(missingCredsConnection)).toBe(false)
  })

  test('should return false for null settings', () => {
    const nullSettingsConnection = createConnForExpiry({settings: null})
    expect(connectionExpired(nullSettingsConnection)).toBe(false)
  })
})

// --- Integration tests for checkConnection (requires DB) ---
describeEachDatabase(
  {drivers: ['pglite'], migrate: true, logger: false},
  (db) => {
    function getTestContext(viewer: Viewer): RouterContext {
      const ctx = routerContextFromViewer({db, viewer})
      return {
        ...ctx,
        fetch: jest.fn<typeof fetch>().mockResolvedValue(new Response()),
      }
    }

    const orgId = 'org_check_conn_integ'
    const customerId = 'cus_check_conn_integ' as CustomerId
    const asOrg = getTestContext({role: 'org', orgId})
    const asCustomer = getTestContext({role: 'customer', customerId, orgId})

    // IDs for the connector that implements checkConnection
    let ccfgIdAcme: string
    let connIdAcme: string
    const connectorAcme = 'acme-oauth2'

    // IDs for the connector that does NOT implement checkConnection
    let ccfgIdGreenhouse: string
    let connIdGreenhouse: string
    const connectorGreenhouse = 'greenhouse'

    beforeEach(async () => {
      jest.restoreAllMocks() // Restore any spies

      const ccfgAcme = await asOrg.db
        .insert(schema.connector_config)
        // @ts-expect-error - Intentionally modifying connector for test
        .values({
          org_id: orgId,
          connector_name: connectorAcme,
          config: {client_id: 'acme-client', client_secret: 'acme-secret'},
        })
        .returning()
      ccfgIdAcme = ccfgAcme[0]!.id

      const connAcme = await asOrg.db
        .insert(schema.connection)
        // @ts-expect-error - Intentionally modifying connector for test
        .values({
          id: makeId('conn', connectorAcme, 'test1'),
          connector_config_id: ccfgIdAcme,
          customer_id: customerId,
          integration_id: null,
          connector_name: connectorAcme,
          org_id: orgId,
          settings: {oauth: {credentials: {access_token: 'acme-token'}}},
        })
        .returning()
      connIdAcme = connAcme[0]!.id

      // --- Create records for greenhouse ---
      const ccfgGreenhouse = await asOrg.db
        .insert(schema.connector_config)
        // @ts-expect-error - Intentionally modifying connector for test
        .values({
          org_id: orgId,
          connector_name: connectorGreenhouse,
          config: {apiKey: 'gh-key'}, // Config for greenhouse
        })
        .returning()
      ccfgIdGreenhouse = ccfgGreenhouse[0]!.id

      const connGreenhouse = await asOrg.db
        .insert(schema.connection)
        // @ts-expect-error - Intentionally modifying connector for test
        .values({
          id: makeId('conn', connectorGreenhouse, 'test2'),
          connector_config_id: ccfgIdGreenhouse,
          customer_id: customerId,
          integration_id: null,
          connector_name: connectorGreenhouse,
          org_id: orgId,
          settings: {apiKey: 'gh-key'}, // Settings for greenhouse
        })
        .returning()
      connIdGreenhouse = connGreenhouse[0]!.id
    })

    afterEach(async () => {
      jest.restoreAllMocks()
      // Clean up database entries for both connectors
      if (connIdAcme) {
        await asOrg.db
          .delete(schema.connection)
          .where(eq(schema.connection.id, connIdAcme))
      }
      if (ccfgIdAcme) {
        await asOrg.db
          .delete(schema.connector_config)
          .where(eq(schema.connector_config.id, ccfgIdAcme))
      }
      if (connIdGreenhouse) {
        await asOrg.db
          .delete(schema.connection)
          .where(eq(schema.connection.id, connIdGreenhouse))
      }
      if (ccfgIdGreenhouse) {
        await asOrg.db
          .delete(schema.connector_config)
          .where(eq(schema.connector_config.id, ccfgIdGreenhouse))
      }
    })

    test('should update connection status on successful check (acme-oauth2)', async () => {
      const initialConn = await asCustomer.db.query.connection.findFirst({
        where: eq(schema.connection.id, connIdAcme),
      })
      expect(initialConn).toBeDefined()
      expect(initialConn?.status).toBeNull()

      const checkConnectionSpy = jest
        .spyOn(serverConnectors[connectorAcme], 'checkConnection' as any)
        .mockResolvedValue({
          status: 'healthy',
          status_message: 'Acme OK',
          settings: {refreshed: 'acme-data'},
        } as any)

      const newInstanceSpy = jest
        .spyOn(serverConnectors[connectorAcme], 'newInstance' as any)
        .mockReturnValue({})

      await checkConnection(initialConn!, asCustomer)

      const updatedConn = await asCustomer.db.query.connection.findFirst({
        where: eq(schema.connection.id, connIdAcme),
      })

      expect(checkConnectionSpy).toHaveBeenCalledTimes(1)
      expect(newInstanceSpy).toHaveBeenCalledTimes(1)
      expect(updatedConn?.status).toEqual('healthy')
      expect(updatedConn?.status_message).toEqual('Acme OK')
      expect((updatedConn?.settings as any)?.refreshed).toEqual('acme-data')
      expect(updatedConn?.updated_at).not.toEqual(initialConn?.updated_at)
    })

    test('should handle null status/message from checkConnection result (acme-oauth2)', async () => {
      const initialConn = await asCustomer.db.query.connection.findFirst({
        where: eq(schema.connection.id, connIdAcme),
      })
      expect(initialConn).toBeDefined()

      const checkConnectionSpy = jest
        .spyOn(serverConnectors[connectorAcme], 'checkConnection' as any)
        .mockResolvedValue({
          status: null,
          status_message: null,
        } as any)

      const newInstanceSpy = jest
        .spyOn(serverConnectors[connectorAcme], 'newInstance' as any)
        .mockReturnValue({} as any)

      const result = await checkConnection(initialConn!, asCustomer)

      const updatedConn = await asCustomer.db.query.connection.findFirst({
        where: eq(schema.connection.id, connIdAcme),
      })

      expect(checkConnectionSpy).toHaveBeenCalledTimes(1)
      expect(newInstanceSpy).toHaveBeenCalledTimes(1)
      expect(updatedConn?.status).toBeNull()
      expect(updatedConn?.status_message).toBeNull()
      expect(updatedConn?.settings).toEqual({
        oauth: {credentials: {access_token: 'acme-token'}},
      }) // Settings unchanged
      expect(result.status).toBeNull()
      expect(result.status_message).toBeNull()
    })

    test('should throw NOT_IMPLEMENTED if connector does not implement checkConnection (greenhouse)', async () => {
      const connGreenhouse = await asCustomer.db.query.connection.findFirst({
        where: eq(schema.connection.id, connIdGreenhouse),
      })
      expect(connGreenhouse).toBeDefined()

      // Temporarily remove checkConnection for this specific test
      const originalCheckConnection =
        serverConnectors[connectorGreenhouse].checkConnection
      // @ts-expect-error - Intentionally modifying connector for test
      serverConnectors[connectorGreenhouse].checkConnection = undefined

      // No spy needed - we expect the actual connector check to fail
      await expect(
        checkConnection(connGreenhouse!, asCustomer),
      ).rejects.toThrow(
        new TRPCError({
          code: 'NOT_IMPLEMENTED',
          message: `Connector ${connectorGreenhouse} does not support check_connection`,
        }),
      )
      // Restore original method (though afterEach restoreAllMocks should also handle it)
      serverConnectors[connectorGreenhouse].checkConnection =
        originalCheckConnection
    })

    test('should throw TRPCError if connector_config_id is null', async () => {
      const conn = await asCustomer.db.query.connection.findFirst({
        where: eq(schema.connection.id, connIdAcme), // Use Acme conn for this error case
      })
      conn!.connector_config_id = null

      await expect(checkConnection(conn!, asCustomer)).rejects.toThrow(
        new TRPCError({
          code: 'NOT_FOUND',
          message: `Connector config not found for connection ${connIdAcme}`,
        }),
      )
    })

    test('should throw TRPCError if connector config not found in db', async () => {
      const conn = await asCustomer.db.query.connection.findFirst({
        where: eq(schema.connection.id, connIdAcme), // Use Acme conn for this error case
      })
      conn!.connector_config_id = makeId('ccfg', connectorAcme, 'not_real')

      await expect(checkConnection(conn!, asCustomer)).rejects.toThrow(
        new TRPCError({
          code: 'NOT_FOUND',
          message: `Connector config ${conn!.connector_config_id} not found`,
        }),
      )
    })

    // Note: Testing "Connector not found" requires manipulating the input
    // `connection.connector_name` or mocking serverConnectors, which deviates
    // from the minimal mocking approach here.
  },
)
