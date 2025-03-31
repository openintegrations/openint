import type {NextRequest} from 'next/server'
import {ConnectorServer} from '@openint/cdk'
import {and, desc, eq, isNotNull, lt, schema, sql} from '@openint/db'
import {initDbNeon} from '@openint/db/db.neon'
import {envRequired, isProduction} from '@openint/env'
import {serverConnectors} from '../../../../../../connectors/all-connectors/connectors.server'

export async function GET(request: NextRequest) {
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
        isNotNull(
          sql`schema.connection.settings->'oauth'->'credentials'->>'refresh_token'`,
        ),
        isNotNull(
          sql`schema.connection.settings->'oauth'->'credentials'->>'expires_at'`,
        ),
        lt(
          sql`schema.connection.settings->'oauth'->'credentials'->>'expires_at'`,
          new Date(Date.now() + 1000 * 60 * 30),
        ),
      ),
    )
    .orderBy(desc(schema.connection.updated_at))

  // Group connections by connector_name
  const connectionsByConnector = expiringConnections.reduce(
    (acc, connection) => {
      const connectorName = connection.connection.connector_name
      if (!acc[connectorName]) {
        acc[connectorName] = []
      }
      acc[connectorName].push(connection)
      return acc
    },
    {} as Record<string, typeof expiringConnections>,
  )

  // Process each connector group with concurrency limit
  const processConnectorGroup = async (
    connections: typeof expiringConnections,
  ) => {
    const chunks = []
    for (
      let i = 0;
      i < connections.length;
      i += envRequired.REFRESH_CONNECTION_CONCURRENCY
    ) {
      chunks.push(
        connections.slice(i, i + envRequired.REFRESH_CONNECTION_CONCURRENCY),
      )
    }

    for (const chunk of chunks) {
      await Promise.all(
        chunk.map(async (connection) => {
          const connector = serverConnectors[
            connection.connection
              .connector_name as keyof typeof serverConnectors
          ] as ConnectorServer
          if (!connector) {
            console.warn(
              `Connector ${connection.connection.connector_name} not found for connection id ${connection.connection.id}, skipping refresh connection`,
            )
            return
          }
          if (!connector.refreshConnection) {
            console.warn(
              `Connector ${connection.connection.connector_name} does not support refreshConnection, skipping refresh connection`,
            )
            return
          }
          try {
            const refreshedSettings = await connector.refreshConnection(
              connection.connection.settings,
              connection.connector_config.config,
            )
            await db
              .update(schema.connection)
              .set({
                settings: refreshedSettings,
                updated_at: new Date().toISOString(),
              })
              .where(eq(schema.connection.id, connection.connection.id))
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

  // Process all connector groups in parallel
  await Promise.all(
    Object.entries(connectionsByConnector).map(([_, connections]) =>
      processConnectorGroup(connections),
    ),
  )

  return Response.json({
    totalConnections: expiringConnections.length,
    totalConnectionsRefreshed: Object.values(connectionsByConnector).reduce(
      (acc, connections) => acc + connections.length,
      0,
    ),
  })
}
