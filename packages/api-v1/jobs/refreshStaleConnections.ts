import type {Handler} from 'elysia'
import type {ConnectorServer} from '@openint/cdk'
import type {Database} from '@openint/db'

import {serverConnectors} from '@openint/all-connectors/connectors.server'
import {and, desc, eq, isNotNull, lt, schema, sql} from '@openint/db'
import {initDbNeon} from '@openint/db/db.neon'
import {envRequired, isProduction} from '@openint/env'

interface RefreshResult {
  totalConnections: number
  totalConnectionsRefreshed: number
}

export async function refreshStaleConnections(
  db: Database,
  options: {
    concurrencyLimit: number
    expiryWindowMs?: number // Time window in ms to consider a token as expiring
    connectors?: Record<string, ConnectorServer> // For testing purposes
  },
): Promise<RefreshResult> {
  const expiryWindow = options.expiryWindowMs ?? 1000 * 60 * 30 // Default 30 minutes
  const connectors = options.connectors ?? serverConnectors

  const expiringConnections = await db
    .select({
      connection: schema.connection,
      connector_config: schema.connector_config,
    })
    .from(schema.connection)
    .innerJoin(
      schema.connector_config,
      eq(schema.connection.connector_config_id, schema.connector_config.id),
    )
    .where(
      and(
        isNotNull(sql`
          connection.settings -> 'oauth' -> 'credentials' ->> 'refresh_token'
        `),
        isNotNull(sql`
          connection.settings -> 'oauth' -> 'credentials' ->> 'expires_at'
        `),
        lt(
          sql`
            (connection.settings -> 'oauth' -> 'credentials' ->> 'expires_at')::timestamp
          `,
          new Date(Date.now() + expiryWindow),
        ),
      ),
    )
    .orderBy(desc(schema.connection.updated_at))

  // Group connections by connector_name
  const connectionsByConnector = expiringConnections.reduce<
    Record<string, typeof expiringConnections>
  >((acc, connection) => {
    const connectorName = connection.connection.connector_name
    if (!acc[connectorName]) {
      acc[connectorName] = []
    }
    acc[connectorName].push(connection)
    return acc
  }, {})

  let successfulRefreshes = 0

  // Process each connector group with concurrency limit
  const processConnectorGroup = async (
    connections: typeof expiringConnections,
  ) => {
    const chunks = []
    for (let i = 0; i < connections.length; i += options.concurrencyLimit) {
      chunks.push(connections.slice(i, i + options.concurrencyLimit))
    }

    for (const chunk of chunks) {
      await Promise.all(
        chunk.map(async (connection) => {
          const connector = connectors[
            connection.connection.connector_name as keyof typeof connectors
          ] as ConnectorServer
          if (!connector?.checkConnection) {
            return
          }

          try {
            // TODO: Fix em

            const connUpdate = await connector.checkConnection({
              settings: connection.connection.settings,
              config: connection.connector_config.config,
              options: {},
              instance: undefined,
              context: {} as never,
            })
            await db
              .update(schema.connection)
              .set({
                settings: connUpdate.settings,
                status: connUpdate.status,
                status_message: connUpdate.status_message,
                updated_at: new Date().toISOString(),
              })
              .where(eq(schema.connection.id, connection.connection.id))

            successfulRefreshes++
          } catch (error) {
            console.error(
              `Failed to refresh connection ${connection.connection.id}:`,
              error,
            )
          }
        }),
      )
    }
  }

  await Promise.all(
    Object.entries(connectionsByConnector).map(([_, connections]) =>
      processConnectorGroup(connections),
    ),
  )

  return {
    totalConnections: expiringConnections.length,
    totalConnectionsRefreshed: successfulRefreshes,
  }
}

export const handleRefreshStaleConnections: Handler = async ({request}) => {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${envRequired.CRON_SECRET}`) {
    return new Response('Unauthorized', {
      status: 401,
    })
  }

  if (!isProduction) {
    console.warn('Refreshing stale connections in non-production environment')
    return Response.json({
      totalConnections: 0,
      totalConnectionsRefreshed: 0,
    })
  }

  const db = initDbNeon(envRequired.DATABASE_URL)

  const result = await refreshStaleConnections(db, {
    concurrencyLimit: Number(envRequired.REFRESH_CONNECTION_CONCURRENCY) || 3,
  })

  return Response.json(result)
}
