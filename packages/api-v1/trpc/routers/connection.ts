import type {ConnectorServer, ExtCustomerId} from '@openint/cdk'
<<<<<<< HEAD
=======
import type {Z, Z} from '@openint/util/zod-utils'
>>>>>>> a3545c1d (migrating create connection)

import {TRPCError} from '@trpc/server'
import {serverConnectors} from '@openint/all-connectors/connectors.server'
import {zDiscriminatedSettings} from '@openint/all-connectors/schemas'
import {makeId} from '@openint/cdk'
import {and, any, dbUpsertOne, eq, schema, sql} from '@openint/db'
import {getBaseURLs} from '@openint/env'
import {makeUlid} from '@openint/util/id-utils'
import {z, zCoerceArray} from '@openint/util/zod-utils'
import {authenticatedProcedure, orgProcedure, router} from '../_base'
import {getAbsoluteApiV1URL} from '../../lib/typed-routes'
import {core} from '../../models/core'
import {
  expandConnection,
  zConnectionExpanded,
  zConnectionExpandOption,
  zIncludeSecrets,
  zRefreshPolicy,
} from './connection.models'
import {zConnectorName} from './connector.models'
<<<<<<< HEAD
import {zListParams, zListResponse} from './utils/pagination'
=======
import {checkConnection} from './utils/connectionChecker'
import {
  applyPaginationAndOrder,
  processPaginatedResponse,
  zListParams,
  zListResponse,
} from './utils/pagination'
>>>>>>> a3545c1d (migrating create connection)
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
        include_secrets: zIncludeSecrets.optional(),
        refresh_policy: zRefreshPolicy.optional().default('auto'),
        expand: zCoerceArray(zConnectionExpandOption).optional().default([]),
      }),
    )
    .output(zConnectionExpanded)
    .query(async ({ctx, input}) => {
      // console.log(
      //   'getConnection',
      //   input.id,
      //   input.include_secrets,
      //   input.refresh_policy,
      //   input.expand,
      // )
      let connection = await ctx.db.query.connection.findFirst({
        columns: input.include_secrets ? undefined : {settings: false},
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
        input.refresh_policy === 'force' ||
        (input.refresh_policy === 'auto' &&
        connection.settings?.oauth?.credentials?.expires_at
          ? new Date(connection.settings.oauth.credentials.expires_at) <
            new Date()
          : false)

      if (
        credentialsRequiresRefresh &&
        'checkConnection' in connector &&
        typeof connector.checkConnection === 'function'
      ) {
        const ccfg = await ctx.db.query.connector_config.findFirst({
          where: eq(
            schema.connector_config.id,
            connection.connector_config_id!,
          ),
          columns: {
            id: true,
            connector_name: true,
            config: true,
            created_at: true,
            updated_at: true,
          },
        })

        if (!ccfg) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Connector config not found',
          })
        }

        const context = {
          webhookBaseUrl: getAbsoluteApiV1URL(`/webhook/${ccfg.connector_name}`),
          extCustomerId: (ctx.viewer.role === 'customer'
            ? ctx.viewer.customerId
            : ctx.viewer.userId) as ExtCustomerId,
          fetch: ctx.fetch,
          baseURLs: getBaseURLs(null),
        }

        const instance = connector.newInstance?.({
          config: ccfg.config,
          settings: undefined,
          context,
          fetchLinks: [],
          onSettingsChange: () => {}, // noop
        })

        const connUpdate = await connector.checkConnection({
          settings: connection.settings,
          config: ccfg.config,
          options: {},
          instance,
          context,
        })
        const updatedConnection = await ctx.db
          .update(schema.connection)
          .set({
            settings: connUpdate.settings,
            status: connUpdate.status,
            status_message: connUpdate.status_message,
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

      return expandConnection(connection!, input.expand)
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
      zListParams.extend({
        connector_names: zCoerceArray(zConnectorName).optional().openapi({
          description: 'Filter list by connector names',
        }),
        customer_id: zCustomerId.optional().openapi({
          description: 'Filter list by customer id',
        }),
        connector_config_id: zConnectorConfigId.optional().openapi({
          description: 'Filter list by connector config id',
        }),
        include_secrets: zIncludeSecrets.optional().openapi({
          description: 'Include secret credentials in the response',
        }),
        expand: z
          .array(zConnectionExpandOption)
          .optional()
          .default([])
          .openapi({
            description: 'Expand the response with additional optionals',
          }),
      }),
    )
    .output(
      zListResponse(zConnectionExpanded).describe('The list of connections'),
    )
    .query(async ({ctx, input}) => {
      const query = ctx.db.query.connection.findMany({
        columns: input.include_secrets ? undefined : {settings: false},
        where: and(
          input.connector_config_id
            ? eq(
                schema.connection.connector_config_id,
                input.connector_config_id,
              )
            : undefined,
          input.customer_id
            ? eq(schema.connection.customer_id, input.customer_id)
            : undefined,
          eq(
            schema.connection.connector_name,
            // excluding data from old connectors that are no longer supported
            any(input.connector_names ?? zConnectorName.options),
          ),
        ),
        extras: {
          total: sql<number>`count(*) OVER ()`.as('total'),
        },
      })

      const res = await query
      const total = res[0]?.total ?? 0
      const items = res.map((conn) => expandConnection(conn, input.expand))

      // const {items, total} = extractTotal(await query, 'total')

      return {
        items,
        total,
        limit: input.limit ?? 50,
        offset: input.offset ?? 0,
      }

      // const {query, limit, offset} = applyPaginationAndOrder(
      //   ctx.db
      //     .select({
      //       connection: schema.connection,
      //       total: sql`count(*) OVER ()`,
      //     })
      //     .from(schema.connection)
      //     .where(
      //       and(
      //         input?.connector_config_id
      //           ? eq(
      //               schema.connection.connector_config_id,
      //               input.connector_config_id,
      //             )
      //           : undefined,
      //         input?.['customer_id']
      //           ? eq(schema.connection.customer_id, input['customer_id'])
      //           : undefined,
      //         input?.['connector_names'] && input['connector_names'].length > 0
      //           ? inArray(
      //               schema.connection.connector_name,
      //               input['connector_names'],
      //             )
      //           : undefined,
      //         // excluding data from old connectors that are no longer supported
      //         inArray(schema.connection.connector_name, connectorNames),
      //         // connectorNamesFromToken.length > 0
      //         //   ? inArray(
      //         //       schema.connection.connector_name,
      //         //       connectorNamesFromToken,
      //         //     )
      //         //   : undefined,
      //       ),
      //     ),
      //   schema.connection.created_at,
      //   input,
      // )

      // const {items, total} = await processPaginatedResponse(query, 'connection')

      // const expandedItems = items.map((conn) =>
      //   formatConnection(
      //     ctx,
      //     conn as any,
      //     input?.include_secrets,
      //     input?.expand ?? [],
      //   ),
      // )

      // // let failures = 0
      // // expandedItems.forEach((item) => {
      // //   try {
      // //     zConnectionExpanded.parse(item)
      // //     // console.log('success parsing', item.id)
      // //   } catch (error) {
      // //     console.error('Failed to parse connection:', item.id)
      // //     failures++
      // //   }
      // // })
      // // console.log('failures', failures)
      // // if (failures > 0) {
      // //   throw new TRPCError({
      // //     code: 'INTERNAL_SERVER_ERROR',
      // //     message: `Failed to parse ${failures} connections`,
      // //   })
      // // }

      // return {
      //   // TODO: fix this to respect rls policy... Add corresponding tests also
      //   items: expandedItems,
      //   total,
      //   limit,
      //   offset,
      // }
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

<<<<<<< HEAD
      // Get connector implementation
      const connector = serverConnectors[
        input.data.connector_name as keyof typeof serverConnectors
      ] as ConnectorServer
      if (!connector) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: `Connector ${input.data.connector_name} not found`,
        })
      }

      let settings = input.data.settings
      let status = null
      let status_message = null
      if (input.check_connection) {
        if (
          !('newInstance' in connector) ||
          typeof connector.newInstance !== 'function' ||
          !('checkConnection' in connector) ||
          typeof connector.checkConnection !== 'function'
        ) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: `Connector ${input.data.connector_name} does not support connection checking`,
          })
        }
        const context = {
          webhookBaseUrl: getAbsoluteApiV1URL(`/webhook/${ccfg.connector_name}`),
          extCustomerId: ctx.viewer.userId as ExtCustomerId,
          fetch: ctx.fetch,
          baseURLs: getBaseURLs(null),
        }

        const instance = connector.newInstance?.({
          config: ccfg.config,
          settings: input.data.settings,
          context,
          fetchLinks: [],
          onSettingsChange: () => {}, // noop
        })
        const connUpdate = await connector.checkConnection({
          settings,
          config: ccfg.config,
          options: {},
          instance,
          context,
        })
        settings = connUpdate.settings
        status = connUpdate.status
        status_message = connUpdate.status_message
      }

      // Create connection record
=======
>>>>>>> a3545c1d (migrating create connection)
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
