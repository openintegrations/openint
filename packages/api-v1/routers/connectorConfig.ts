import {TRPCError} from '@trpc/server'
import {defConnectors} from '@openint/all-connectors/connectors.def'
import {makeId} from '@openint/cdk'
import {and, asc, desc, eq, schema, sql} from '@openint/db'
import {makeUlid} from '@openint/util/id-utils'
import {z} from '@openint/util/zod-utils'
import type {ConnectorConfig} from '../models'
import {
  connectorConfigExtended,
  core,
  zConnectorConfigExpandOption,
} from '../models'
import {authenticatedProcedure, orgProcedure, router} from '../trpc/_base'
import {getConnectorModelByName, zConnectorName} from './connector.models'
import {zListParams, zListResponse} from './utils/pagination'
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
        'The list of connector configurations',
      ),
    )
    .query(async ({ctx, input: {expand, connector_name, ...params} = {}}) => {
      const includeConnectionCount = expand?.includes('connection_count')

      const connectorNames = Object.keys(defConnectors)

      const connectionCountExtra = {
        // Need to cast to double precision to avoid being used as string
        connection_count: sql<number>`(
          SELECT COUNT(*)
          FROM ${schema.connection}
          WHERE ${schema.connection}.connector_config_id = ${schema.connector_config.id}
        )`.as('connection_count'),
      }

      const items = await ctx.db.query.connector_config.findMany({
        extras: {
          total: sql<number>`count(*) over ()`.as('total'),
          // TODO: Fix typing to make connection_count optional
          ...((includeConnectionCount &&
            connectionCountExtra) as typeof connectionCountExtra),
        },
        where: and(
          connector_name
            ? eq(schema.connector_config.connector_name, connector_name)
            : undefined,
          // excluding data from old connectors that are no longer supported
          eq(
            schema.connector_config.connector_name,
            sql`ANY(${sql.param(connectorNames)})`,
          ),
        ),
        orderBy: [
          desc(schema.connector_config.updated_at),
          asc(schema.connector_config.id),
        ],
        limit: params?.limit ?? 50,
        offset: params?.offset ?? 0,
      })

      const limit = params?.limit ?? 50
      const offset = params?.offset ?? 0
      const total = items[0]?.total ?? 0

      console.log(items)
      const expandedItems = items.map((item) => {
        const ccfg: ConnectorConfig = item
        if (
          expand?.includes('connector') ||
          expand?.includes('connector.schemas')
        ) {
          ccfg.connector = getConnectorModelByName(item.connector_name, {
            includeSchemas: expand?.includes('connector.schemas'),
          })
        }
        return ccfg
      })

      return {
        items: expandedItems,
        total,
        limit,
        offset,
      }
    }),
  createConnectorConfig: orgProcedure
    .meta({
      openapi: {method: 'POST', path: '/connector-config', enabled: false},
    })
    .input(core.connector_config_insert)
    .output(core.connector_config_select)
    .mutation(async ({ctx, input: {connector_name, ...input}}) => {
      const [ccfg] = await ctx.db
        .insert(schema.connector_config)
        .values({
          ...input,
          org_id: ctx.viewer.orgId,
          id: makeId('ccfg', connector_name, makeUlid()),
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
    .output(core.connector_config_select)
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
