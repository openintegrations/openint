import {TRPCError} from '@trpc/server'
import {makeId} from '@openint/cdk'
import {and, eq, schema, sql} from '@openint/db'
import {makeUlid} from '@openint/util/id-utils'
import {z} from '@openint/util/zod-utils'
import {core, type Core} from '../models/core'
import {authenticatedProcedure, orgProcedure, router} from '../trpc/_base'
import {
  getConnectorModelByName,
  zConnectorName,
  type ConnectorName,
} from './connector.models'
import {connectorConfigExtended, zConnectorConfigExpandOption} from './connectorConfig.models'
import {
  applyPaginationAndOrder,
  processPaginatedResponse,
  zListParams,
  zListResponse,
} from './utils/pagination'
import {zConnectorConfigId} from './utils/types'

export const connectorConfigRouter = router({
  listConnectorConfigs: authenticatedProcedure
    .meta({
      openapi: {
        method: 'GET',
        path: '/connector-config',
        description:
          'List the connectors that are configured in your account and available for your customers',
        summary: 'List Configured Connectors',
      },
    })
    .input(
      zListParams
        .extend({
          expand: z.array(zConnectorConfigExpandOption).optional(),
          connector_name: zConnectorName
            .optional()
            .describe('The name of the connector to filter by'),
        })
        .optional(),
    )
    .output(
      zListResponse(connectorConfigExtended).describe(
        'The list of connector configs',
      ),
    )
    .query(async ({ctx, input}) => {
      const {query, limit, offset} = applyPaginationAndOrder(
        ctx.db
          .select({
            connector_config: schema.connector_config,
            total: sql`count(*) over()`,
          })
          .from(schema.connector_config)
          .where(
            and(
              input?.connector_name
                ? eq(
                    schema.connector_config.connector_name,
                    input.connector_name,
                  )
                : undefined,
            ),
          ),
        schema.connector_config.created_at,
        input,
      )

      const {items, total} = await processPaginatedResponse(
        query,
        'connector_config',
      )

      return {
        items: await Promise.all(
          items.map(async (item: any) => {
            const ccfg: Core['connector_config'] = item
            let expandedFields = {}

            if (input?.expand?.includes('connector')) {
              expandedFields = {
                connector: getConnectorModelByName(
                  ccfg.connector_name as ConnectorName,
                ),
              }
            }

            if (input?.expand?.includes('connection_count')) {
              const connectionCount = await ctx.db
                .select({
                  count: sql`count(*)`,
                })
                .from(schema.connection)
                .where(eq(schema.connection.connector_config_id, ccfg.id))
                .then((rows) => rows[0]?.count ?? 0)

              expandedFields = {
                ...expandedFields,
                connection_count: connectionCount,
              }
            }

            return {
              ...ccfg,
              ...expandedFields,
            }
          }),
        ),
        total,
        limit,
        offset,
      }
    }),
  createConnectorConfig: orgProcedure
    .meta({
      openapi: {method: 'POST', path: '/connector-config', enabled: false},
    })
    .input(
      z.object({
        connector_name: z.string(),
        display_name: z.string().optional(),
        disabled: z.boolean().optional(),
        config: z.record(z.unknown()).nullish(),
      }),
    )
    .output(
      z.intersection(
        core.connector_config,
        z.object({
          config: z.record(z.unknown()).nullable(),
        }),
      ),
    )
    .mutation(async ({ctx, input}) => {
      const {connector_name, display_name, disabled, config} = input
      const [ccfg] = await ctx.db
        .insert(schema.connector_config)
        .values({
          org_id: ctx.viewer.orgId,
          id: makeId('ccfg', connector_name, makeUlid()),
          display_name,
          disabled,
          config,
        })
        .returning()

      return ccfg!
    }),
  updateConnectorConfig: orgProcedure
    .meta({
      openapi: {method: 'PUT', path: '/connector-config/{id}', enabled: false},
    })
    .input(
      z.object({
        id: zConnectorConfigId,
        display_name: z.string().optional(),
        disabled: z.boolean().optional(),
        config: z.record(z.unknown()).nullish(),
      }),
    )
    .output(
      z.intersection(
        core.connector_config,
        z.object({
          config: z.record(z.unknown()).nullable(),
        }),
      ),
    )
    .mutation(async ({ctx, input}) => {
      const {id, config, display_name, disabled} = input
      const res = await ctx.db
        .update(schema.connector_config)
        .set({
          display_name,
          disabled,
          ...(config !== undefined ? {config} : {}),
          updated_at: new Date().toISOString(),
        })
        .where(eq(schema.connector_config.id, id))
        .returning()

      const [ccfg] = res
      if (!ccfg) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: `Connector config with ID "${id}" not found`,
        })
      }

      return ccfg!
    }),
  deleteConnectorConfig: orgProcedure
    .meta({
      openapi: {
        method: 'DELETE',
        path: '/connector-config/{id}',
        enabled: false,
      },
    })
    .input(z.object({id: zConnectorConfigId}))
    .output(z.object({id: zConnectorConfigId}))
    .mutation(async ({ctx, input}) => {
      const {id} = input

      const existingConfig = await ctx.db
        .select({id: schema.connector_config.id})
        .from(schema.connector_config)
        .where(eq(schema.connector_config.id, id))
        .limit(1)

      if (!existingConfig.length) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: `Connector config with ID "${id}" not found`,
        })
      }

      await ctx.db
        .delete(schema.connector_config)
        .where(eq(schema.connector_config.id, id))

      return {id}
    }),
})
