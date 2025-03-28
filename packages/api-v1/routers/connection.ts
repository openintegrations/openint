import {TRPCError} from '@trpc/server'
import {z} from 'zod'
import {defConnectors} from '@openint/all-connectors/connectors.def'
import {serverConnectors} from '@openint/all-connectors/connectors.server'
import {and, eq, schema, sql} from '@openint/db'
import {core} from '../models'
import {authenticatedProcedure, orgProcedure, router} from '../trpc/_base'
import {type RouterContext} from '../trpc/context'
import {expandConnector} from './connectorConfig'
import {
  applyPaginationAndOrder,
  processPaginatedResponse,
  zListParams,
  zListResponse,
} from './utils/pagination'
import {
  zConnectionId,
  zConnectorConfigId,
  zConnectorName,
  zCustomerId,
} from './utils/types'

const zIncludeSecrets = z
  .enum(['none', 'basic', 'all'])
  .describe(
    'Controls secret inclusion: none (default), basic (auth only), or all secrets',
  )
const zRefreshPolicy = z
  .enum(['none', 'force', 'auto'])
  .describe(
    'Controls credential refresh: none (never), force (always), or auto (when expired, default)',
  )

const zConnectionStatus = z
  .enum(['healthy', 'disconnected', 'error', 'manual'])
  .describe(
    'Connection status: healthy (all well), disconnected (needs reconnection), error (system issue), manual (import connection)',
  )

const zConnectionError = z
  .enum(['refresh_failed', 'unknown_external_error'])
  .describe('Error types: refresh_failed and unknown_external_error')

function stripSensitiveOauthCredentials(credentials: any) {
  return {
    ...credentials,
    refresh_token: undefined,
    raw: undefined,
  }
}

async function formatConnection(
  ctx: RouterContext,
  connection: z.infer<typeof core.connection>,
  include_secrets: z.infer<typeof zIncludeSecrets> = 'none',
  expand: z.infer<typeof zExpandOptions>[] = [],
) {
  const connector =
    defConnectors[connection.connector_name as keyof typeof defConnectors]
  if (!connector) {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: `Connector not found for connection ${connection.id}`,
    })
  }

  // Handle different levels of secret inclusion
  // the default is 'none' at which point settings should be an empty object
  let settingsToInclude = {settings: {}}
  if (include_secrets === 'basic' && connection.settings.oauth) {
    settingsToInclude = {
      settings: {
        ...connection.settings,
        // NOTE: in future we should add other settings sensitive value
        // stripping for things like api key here and abstract it
        oauth: connection.settings?.oauth?.credentials
          ? {
              ...connection.settings.oauth,
              credentials: stripSensitiveOauthCredentials(
                connection.settings.oauth.credentials,
              ),
            }
          : undefined,
      },
    }
  } else if (include_secrets === 'all') {
    settingsToInclude = {settings: connection.settings}
  }

  let expandedFields = {}
  if (expand.includes('connector')) {
    const connectorConfig = await ctx.db.query.connector_config.findFirst({
      // @ts-expect-error @openint-bot fix me as connector_config_id is optional in db
      where: eq(schema.connector_config.id, connection.connector_config_id),
    })
    if (!connectorConfig) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: `Connector config not found: ${connection.connector_config_id}`,
      })
    }

    expandedFields = {
      connector: expandConnector(connectorConfig),
    }
  }

  return {
    ...connection,
    ...settingsToInclude,
    ...expandedFields,
  }
}

const connectionWithRelations = z
  .intersection(
    core.connection,
    z.object({
      connector: core.connector.optional(),
    }),
  )
  .describe('The connection details')

const zExpandOptions = z
  .enum(['connector'])
  .describe('Fields to expand: connector (includes connector details)')

export const connectionRouter = router({
  getConnection: orgProcedure
    .meta({
      openapi: {
        method: 'GET',
        path: '/connection/{id}',
        description:
          'Get details of a specific connection, including credentials',
        summary: 'Get Connection & Credentials',
      },
    })
    .input(
      z.object({
        id: zConnectionId,
        include_secrets: zIncludeSecrets.optional().default('none'),
        refresh_policy: zRefreshPolicy.optional().default('auto'),
        expand: z.array(zExpandOptions).optional().default([]),
      }),
    )
    .output(connectionWithRelations)
    .query(async ({ctx, input}) => {
      // console.log(
      //   'getConnection',
      //   input.id,
      //   input.include_secrets,
      //   input.refresh_policy,
      //   input.expand,
      // )
      let connection = await ctx.db.query.connection.findFirst({
        where: eq(schema.connection.id, input.id),
      })

      if (!connection) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Connection not found',
        })
      }

      const connector_config = await ctx.db.query.connector_config.findFirst({
        where: eq(schema.connector_config.id, connection.connector_config_id),
        columns: {
          id: true,
          connector_name: true,
          config: true,
          created_at: true,
          updated_at: true,
        },
      })

      if (!connector_config) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Connector config not found',
        })
      }

      const connector =
        serverConnectors[
          connection.connector_name as keyof typeof serverConnectors
        ]
      if (!connector) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: `Connector not found for connection ${connection.id}`,
        })
      }

      const credentialsRequiresRefresh =
        input.refresh_policy === 'force' ||
        (input.refresh_policy === 'auto' &&
        connection.settings.oauth?.credentials?.expires_at
          ? new Date(connection.settings.oauth.credentials.expires_at) <
            new Date()
          : false)

      if (
        credentialsRequiresRefresh &&
        'refreshConnection' in connector &&
        typeof connector.refreshConnection === 'function'
      ) {
        const refreshedConnectionSettings = await connector.refreshConnection(
          connection.settings,
          connector_config.config,
        )
        const updatedConnection = await ctx.db
          .update(schema.connection)
          .set({
            settings: refreshedConnectionSettings,
            updated_at: new Date().toISOString(),
          })
          .where(eq(schema.connection.id, connection.id))
          .returning()
          .then((rows) => rows[0])

        if (!updatedConnection) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to update connection',
          })
        }

        // the initial type of connection has an extra connector_config field so the type doesn't match, hence the any cast
        connection = updatedConnection as any
      }

      return formatConnection(
        ctx,
        // TODO: fix this any casting
        connection as any as z.infer<typeof core.connection>,
        input.include_secrets,
        input.expand,
      )
    }),
  listConnections: authenticatedProcedure
    .meta({
      openapi: {
        method: 'GET',
        path: '/connection',
        description: 'List all connections with optional filtering',
        summary: 'List Connections',
      },
    })
    .input(
      zListParams
        .extend({
          connector_name: zConnectorName.optional(),
          customer_id: zCustomerId.optional(),
          connector_config_id: zConnectorConfigId.optional(),
          include_secrets: zIncludeSecrets.optional().default('none'),
          expand: z.array(zExpandOptions).optional().default([]),
        })
        .optional(),
    )
    .output(
      zListResponse(connectionWithRelations).describe(
        'The list of connections',
      ),
    )
    .query(async ({ctx, input}) => {
      // Create a query that selects all fields from connection and adds a window function for the count
      const {query, limit, offset} = applyPaginationAndOrder(
        ctx.db
          .select({
            connection: schema.connection,
            total: sql`count(*) over()`,
          })
          .from(schema.connection)
          .where(
            and(
              input?.connector_config_id
                ? eq(
                    schema.connection.connector_config_id,
                    input.connector_config_id,
                  )
                : undefined,
              input?.['customer_id']
                ? eq(schema.connection.customer_id, input['customer_id'])
                : undefined,
              input?.['connector_name']
                ? eq(schema.connection.connector_name, input['connector_name'])
                : undefined,
            ),
          ),
        schema.connection.created_at,
        input,
      )

      const {items, total} = await processPaginatedResponse(query, 'connection')

      return {
        // items: await Promise.all(
        //   items.map((conn) =>
        //     formatConnection(
        //       ctx,
        //       conn as any,
        //       input?.include_secrets ?? 'all', // TODO: Change to none once we fix schema issue
        //       input?.expand ?? [],
        //     ),
        //   ),
        // ),
        items,
        total,
        limit,
        offset,
      }
    }),
  checkConnection: orgProcedure
    .meta({
      openapi: {
        method: 'POST',
        path: '/connection/{id}/check',
        description: 'Verify that a connection is healthy',
        summary: 'Check Connection Health',
      },
    })
    .input(
      z.object({
        id: zConnectionId,
      }),
    )
    .output(
      z.object({
        id: zConnectionId,
        status: zConnectionStatus,
        error: zConnectionError.optional(),
        errorMessage: z
          .string()
          .optional()
          .describe('Optional expanded error message'),
      }),
    )
    .mutation(async ({ctx, input}) => {
      const connection = await ctx.db.query.connection.findFirst({
        where: eq(schema.connection.id, input.id),
      })
      if (!connection || !connection.connector_config_id) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Connection not found',
        })
      }

      const credentialsRequiresRefresh = connection.settings.oauth?.credentials
        ?.expires_at
        ? new Date(connection.settings.oauth.credentials.expires_at) <
          new Date()
        : false

      if (credentialsRequiresRefresh) {
        // TODO: implement refresh logic here
        console.warn('Connection requires refresh', credentialsRequiresRefresh)
        // Add actual refresh implementation
      }

      const connector =
        serverConnectors[
          connection.connector_name as keyof typeof serverConnectors
        ]
      if (!connector) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: `Connector not found for connection ${connection.id}`,
        })
      }

      if (
        'checkConnection' in connector &&
        typeof connector.checkConnection === 'function'
      ) {
        try {
          await connector.checkConnection(connection.settings as any)
          // QQ: should this parse the results of checkConnection somehow?
          return {
            id: connection.id as `conn_${string}`,
            status: 'healthy',
          }
        } catch (error) {
          return {
            id: connection.id as `conn_${string}`,
            status: 'disconnected',
            error: 'unknown_external_error',
          }
        }
      }

      // QQ: should we return healthy by default even if there's no check connection implemented?
      return {
        id: connection.id as `conn_${string}`,
        status: 'healthy',
      }
    }),

  deleteConnection: authenticatedProcedure
    .meta({
      openapi: {
        method: 'DELETE',
        path: '/connection/{id}',
      },
    })
    .input(z.object({id: zConnectionId}))
    .output(z.object({id: zConnectionId}))
    .mutation(async ({ctx, input}) => {
      const connection = await ctx.db.query.connection.findFirst({
        where: eq(schema.connection.id, input.id),
      })
      if (!connection) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Connection not found',
        })
      }

      await ctx.db
        .delete(schema.connection)
        .where(eq(schema.connection.id, input.id))
      return {id: connection.id}
    }),
})
