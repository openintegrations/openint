import {ConnectorServer, makeId} from '@openint/cdk'
import {schema, sql} from '@openint/db'
import {describeEachDatabase} from '@openint/db/__tests__/test-utils'
import {makeUlid} from '@openint/util'
import {refreshStaleConnections} from './refreshStaleConnections'

// Create a mock refreshConnection function
const mockRefreshConnection = jest.fn().mockImplementation((settings) => {
  return {
    ...settings,
    oauth: {
      ...settings.oauth,
      credentials: {
        ...settings.oauth.credentials,
        expires_at: new Date(Date.now() + 1000 * 60 * 60).toISOString(), // Set to expire in 1 hour
      },
    },
  }
})

// Create mock connectors - only googledrive implements refreshConnection
const mockConnectors = {
  googledrive: {
    refreshConnection: mockRefreshConnection,
  } as unknown as ConnectorServer,
  greenhouse: {
    // No refreshConnection method
  } as unknown as ConnectorServer,
}

const logger = false

describeEachDatabase({drivers: ['pglite'], migrate: true, logger}, (db) => {
  describe('refreshStaleConnections', () => {
    beforeEach(async () => {
      // Clear any existing data
      await db.delete(schema.connection)
      await db.delete(schema.connector_config)
      mockRefreshConnection.mockClear()
    })

    test('refreshes only connections with connectors that implement refreshConnection', async () => {
      // Create test connector configs
      const googledriveConfigId = makeId('ccfg', 'googledrive', makeUlid())
      const greenhouseConfigId = makeId('ccfg', 'greenhouse', makeUlid())

      await db.insert(schema.connector_config).values([
        {
          id: googledriveConfigId,
          org_id: 'org_test',
        },
        {
          id: greenhouseConfigId,
          org_id: 'org_test',
        },
      ])

      // Create test connections with expiring tokens
      const expiringConnections = [
        // Googledrive connection - should be refreshed
        {
          id: makeId('conn', 'googledrive', makeUlid()),
          connector_config_id: googledriveConfigId,
          settings: {
            oauth: {
              credentials: {
                refresh_token: 'test_refresh_token_gd',
                expires_at: new Date(Date.now() - 1000 * 60).toISOString(), // Expired 1 minute ago
              },
            },
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        // Greenhouse connection - should NOT be refreshed (no refresh method)
        {
          id: makeId('conn', 'greenhouse', makeUlid()),
          connector_config_id: greenhouseConfigId,
          settings: {
            oauth: {
              credentials: {
                refresh_token: 'test_refresh_token_gh',
                expires_at: new Date(Date.now() - 1000 * 60).toISOString(), // Expired 1 minute ago
              },
            },
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        // Another googledrive connection - should be refreshed
        {
          id: makeId('conn', 'googledrive', makeUlid()),
          connector_config_id: googledriveConfigId,
          settings: {
            oauth: {
              credentials: {
                refresh_token: 'test_refresh_token_gd2',
                expires_at: new Date(Date.now() + 1000 * 60 * 15).toISOString(), // Expires in 15 minutes
              },
            },
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]

      await db.insert(schema.connection).values(expiringConnections)

      // Create a non-expiring connection
      await db.insert(schema.connection).values({
        id: makeId('conn', 'googledrive', makeUlid()),
        connector_config_id: googledriveConfigId,
        settings: {
          oauth: {
            credentials: {
              refresh_token: 'test_refresh_token_nonexpiring',
              expires_at: new Date(Date.now() + 1000 * 60 * 60).toISOString(), // Expires in 1 hour
            },
          },
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

      const result = await refreshStaleConnections(db, {
        concurrencyLimit: 5,
        expiryWindowMs: 1000 * 60 * 30, // 30 minutes
        connectors: mockConnectors,
      })

      // We should have found 3 total connections (2 googledrive + 1 greenhouse)
      // But only refreshed 2 (the googledrive ones)
      expect(result).toEqual({
        totalConnections: 3,
        totalConnectionsRefreshed: 2,
      })

      // Verify googledrive connections were updated
      const updatedGoogleDriveConnections = await db
        .select()
        .from(schema.connection)
        .where(
          sql`id LIKE 'conn_googledrive%' AND 
             (settings->'oauth'->'credentials'->>'refresh_token' IN ('test_refresh_token_gd', 'test_refresh_token_gd2'))`,
        )

      expect(updatedGoogleDriveConnections).toHaveLength(2)

      // Verify greenhouse connection was NOT updated (still has old expiry)
      const greenhouseConnections = await db
        .select()
        .from(schema.connection)
        .where(
          sql`connector_name = 'greenhouse' AND (connection.settings->'oauth'->'credentials'->>'expires_at')::timestamp < ${new Date(
            Date.now() + 1000 * 60 * 30,
          )}`,
        )

      expect(greenhouseConnections).toHaveLength(1)

      // Verify that the refreshConnection method was called exactly twice
      expect(mockRefreshConnection).toHaveBeenCalledTimes(2)
    })

    test('handles empty database', async () => {
      const result = await refreshStaleConnections(db, {
        concurrencyLimit: 5,
        connectors: mockConnectors,
      })

      expect(result).toEqual({
        totalConnections: 0,
        totalConnectionsRefreshed: 0,
      })
    })
  })
})
