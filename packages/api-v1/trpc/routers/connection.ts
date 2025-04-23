import type {ConnectorServer} from '@openint/cdk'
import type {Z} from '@openint/util/zod-utils'

import {TRPCError} from '@trpc/server'
import {serverConnectors} from '@openint/all-connectors/connectors.server'
import {zDiscriminatedSettings} from '@openint/all-connectors/schemas'
import {makeId} from '@openint/cdk'
import {and, dbUpsertOne, eq, inArray, schema, sql} from '@openint/db'
import {makeUlid} from '@openint/util/id-utils'
import {z} from '@openint/util/zod-utils'
import {authenticatedProcedure, orgProcedure, router} from '../_base'
import {core} from '../../models/core'
import {
  formatConnection,
  zConnectionExpanded,
  zConnectionExpandOption,
  zIncludeSecrets,
  zRefreshPolicy,
} from './connection.models'
import {zConnectorName} from './connector.models'
import {
  checkConnection,
  connectionCanBeChecked,
} from './utils/connectionChecker'
import {
  applyPaginationAndOrder,
  processPaginatedResponse,
  zListParams,
  zListResponse,
} from './utils/pagination'
import {zConnectionId, zConnectorConfigId, zCustomerId} from './utils/types'

export const connectionRouter = router({
  getConnection: authenticatedProcedure
    .meta({
      openapi: {
        method: 'GET',
        path: '/connection/{id}',
        description:
          'Get details of a specific connection, including credentials',
        summary: 'Get Connection',
      },
    })
    .input(
      z.object({
        id: zConnectionId,
        include_secrets: zIncludeSecrets.optional().default('none'),
        refresh_policy: zRefreshPolicy.optional().default('auto'),
        expand: z.array(zConnectionExpandOption).optional().default([]),
      }),
    )
    .output(zConnectionExpanded)
    .query(async ({ctx, input}) => {
      const connection = await ctx.db.query.connection.findFirst({
        where: eq(schema.connection.id, input.id),
      })

      if (!connection) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Connection not found',
        })
      }

      const connector = serverConnectors[
        connection.connector_name as keyof typeof serverConnectors
      ] as ConnectorServer

      if (!connector) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: `Connector not found for connection ${connection.id}`,
        })
      }

      const credentialsRequiresRefresh =
        input.refresh_policy === 'force' || input.refresh_policy === 'auto'

      if (credentialsRequiresRefresh && connectionCanBeChecked(connection)) {
        const {status, status_message} = await checkConnection(connection, ctx)
        connection.status = status
        connection.status_message = status_message ?? null
      }

      return formatConnection(
        ctx,
        // TODO: fix this any casting
        connection as any as Z.infer<typeof core.connection_select>,
        input.include_secrets,
        input.expand,
      )
    }),
  listConnections: authenticatedProcedure
    .meta({
      openapi: {
        method: 'GET',
        path: '/connection',
        description:
          'List all connections with optional filtering. Does not retrieve secrets or perform any connection healthcheck. For that use `getConnection` or `checkConnectionHealth`.',
        summary: 'List Connections',
      },
    })
    .input(
      zListParams
        .extend({
          connector_names: z.array(zConnectorName).optional().openapi({
            description: 'Filter list by connector names',
          }),
          customer_id: zCustomerId.optional().openapi({
            description: 'Filter list by customer id',
          }),
          connector_config_id: zConnectorConfigId.optional().openapi({
            description: 'Filter list by connector config id',
          }),
          include_secrets: zIncludeSecrets.optional().default('none').openapi({
            description: 'Include secret credentials in the response',
          }),
          expand: z
            .array(zConnectionExpandOption)
            .optional()
            .default([])
            .openapi({
              description: 'Expand the response with additional optionals',
            }),
        })
        .optional(),
    )
    .output(
      zListResponse(zConnectionExpanded).describe('The list of connections'),
    )
    .query(async ({ctx, input}) => {
      // @pellicceama: Have another way to validate
      // const connectorNamesFromToken =
      //   ctx.viewer?.connectOptions?.connector_names ?? []
      const connectorNames = zConnectorName.options
      const {query, limit, offset} = applyPaginationAndOrder(
        ctx.db
          .select({
            connection: schema.connection,
            total: sql`count(*) OVER ()`,
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
              input?.['connector_names'] && input['connector_names'].length > 0
                ? inArray(
                    schema.connection.connector_name,
                    input['connector_names'],
                  )
                : undefined,
              // excluding data from old connectors that are no longer supported
              inArray(schema.connection.connector_name, connectorNames),
              // connectorNamesFromToken.length > 0
              //   ? inArray(
              //       schema.connection.connector_name,
              //       connectorNamesFromToken,
              //     )
              //   : undefined,
            ),
          ),
        schema.connection.created_at,
        input,
      )

      const {items, total} = await processPaginatedResponse(query, 'connection')

      const expandedItems = items.map((conn) =>
        formatConnection(
          ctx,
          conn as any,
          input?.include_secrets ?? 'all', // TODO: Change to none once we fix schema issue
          input?.expand ?? [],
        ),
      )

      // let failures = 0
      // expandedItems.forEach((item) => {
      //   try {
      //     zConnectionExpanded.parse(item)
      //     // console.log('success parsing', item.id)
      //   } catch (error) {
      //     console.error('Failed to parse connection:', item.id)
      //     failures++
      //   }
      // })
      // console.log('failures', failures)
      // if (failures > 0) {
      //   throw new TRPCError({
      //     code: 'INTERNAL_SERVER_ERROR',
      //     message: `Failed to parse ${failures} connections`,
      //   })
      // }

      return {
        // TODO: fix this to respect rls policy... Add corresponding tests also
        items: expandedItems,
        total,
        limit,
        offset,
      }
    }),

  deleteConnection: authenticatedProcedure
    .meta({
      openapi: {
        method: 'DELETE',
        path: '/connection/{id}',
        description: 'Delete a connection',
        summary: 'Delete Connection',
      },
    })
    .input(z.object({id: zConnectionId}))
    .output(z.object({id: zConnectionId}))
    .mutation(async ({ctx, input}) => {
      const [deleted] = await ctx.db
        .delete(schema.connection)
        .where(eq(schema.connection.id, input.id))
        // .returning({id: schema.connection.id}) // Why this this not working? Shoudl work
        .returning()

      if (!deleted) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Connection not found',
        })
      }
      return {id: deleted.id}
    }),

  createConnection: orgProcedure
    .meta({
      openapi: {
        method: 'POST',
        path: '/connection',
        summary: 'Create Connection',
        description: 'Import an existing connection after validation',
      },
    })
    .input(
      z.object({
        connector_config_id: zConnectorConfigId,
        metadata: z.record(z.unknown()).optional(),
        customer_id: zCustomerId,
        data: zDiscriminatedSettings,
        check_connection: z.boolean().optional().default(false).openapi({
          description:
            'Perform a synchronous connection check before creating it.',
        }),
      }),
    )
    .output(core.connection_select)
    .mutation(async ({ctx, input}) => {
      // Verify connector config exists
      const ccfg = await ctx.db.query.connector_config.findFirst({
        where: eq(schema.connector_config.id, input.connector_config_id),
      })
      if (!ccfg) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: `Connector config ${input.connector_config_id} not found`,
        })
      }

      // Verify connector names match
      if (ccfg.connector_name !== input.data.connector_name) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `Connector name mismatch: config is ${ccfg.connector_name} but input is ${input.data.connector_name}`,
        })
      }

      const id = makeId('conn', input.data.connector_name, makeUlid())

      const {status, status_message} = await checkConnection(
        {
          id,
          settings: input.data.settings,
          connector_name: input.data.connector_name,
          connector_config_id: input.connector_config_id,
        } as Z.infer<typeof core.connection_select>,
        ctx,
        serverConnectors[
          input.data.connector_name as keyof typeof serverConnectors
        ] as ConnectorServer,
        true,
      )

      const [conn] = await dbUpsertOne(
        ctx.db,
        schema.connection,
        {
          id,
          settings: input.data.settings,
          connector_config_id: input.connector_config_id,
          customer_id: input.customer_id,
          metadata: input.metadata,
          status,
          status_message,
        },
        {keyColumns: ['id']},
      ).returning()

      if (!conn) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create connection',
        })
      }

      return {
        ...conn,
        customer_id: input.customer_id,
      }
    }),
})
