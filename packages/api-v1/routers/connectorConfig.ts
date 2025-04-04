import {TRPCError} from '@trpc/server'
import {defConnectors} from '@openint/all-connectors/connectors.def'
import {makeId} from '@openint/cdk'
import {and, eq, schema, sql} from '@openint/db'
import {makeUlid} from '@openint/util/id-utils'
import {z, type Z} from '@openint/util/zod-utils'
import {ConnectorConfig, core, type Core} from '../models'
import {
  getConnectorModel,
  getConnectorModelByName,
  zConnectorName,
} from '../models/connectorSchemas'
import {authenticatedProcedure, orgProcedure, router} from '../trpc/_base'
import {
  applyPaginationAndOrder2,
  extractTotal,
  zListParams,
  zListResponse,
} from './utils/pagination'
import {zConnectorConfigId} from './utils/types'

const validateResponse = (res: Array<Core['connector_config']>, id: string) => {
  if (!res.length) {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: `Connector config with ID "${id}" not found`,
    })
  }
}

// TODO: Add connector.schemas
const zExpandOptions = z
  .enum([
    'connector',
    'connector.schemas',
    'enabled_integrations',
    'connection_count',
  ])
  .describe(
    'Fields to expand: connector (includes connector details), enabled_integrations (includes enabled integrations details)',
  )

interface IntegrationConfig {
  enabled?: boolean
  scopes?: string | string[]
  [key: string]: any
}

export function expandIntegrations(
  connectorConfig: Core['connector_config'],
): Record<string, IntegrationConfig> | undefined {
  if (
    !connectorConfig ||
    !connectorConfig.config ||
    !connectorConfig.config.integrations
  ) {
    return undefined
  }

  const {integrations} = connectorConfig.config
  const enabledIntegrations = Object.entries(
    integrations as Record<string, IntegrationConfig>,
  )
    .filter(([_, config]) => config && config.enabled === true)
    .reduce(
      (acc, [key, config]) => {
        acc[key] = config
        return acc
      },
      {} as Record<string, IntegrationConfig>,
    )

  return Object.keys(enabledIntegrations).length > 0
    ? enabledIntegrations
    : undefined
}

const connectorConfigWithRelations = z.intersection(
  core.connector_config,
  z.object({
    connector: core.connector.optional(),
    integrations: z.record(core.integration).optional(),
    connection_count: z.number().optional(),
  }),
)

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
          expand: z.array(zExpandOptions).optional(),
          connector_name: zConnectorName
            .optional()
            .describe('The name of the connector to filter by'),
        })
        .optional(),
    )
    .output(
      zListResponse(connectorConfigWithRelations).describe(
        'The list of connector configurations',
      ),
    )
    .query(async ({ctx, input: {expand, connector_name, ...params} = {}}) => {
      const includeConnectionCount = expand?.includes('connection_count')

      const connectorNames = Object.keys(defConnectors)

      const {query, limit, offset} = applyPaginationAndOrder2({
        query: ctx.db
          .select({
            connector_config: {
              ...schema.connector_config,
              ...(includeConnectionCount
                ? {
                    connection_count: sql<number>`(
                      SELECT COUNT(*)
                      FROM ${schema.connection}
                      WHERE ${schema.connection}.connector_config_id = ${schema.connector_config.id}
                    )`.as('connection_count'),
                  }
                : {}),
            },
            total: sql<number>`count(*) over ()`,
          })
          .from(schema.connector_config)
          .where(
            and(
              connector_name
                ? eq(schema.connector_config.connector_name, connector_name)
                : undefined,
              // excluding data from old connectors that are no longer supported
              eq(
                schema.connector_config.connector_name,
                sql`ANY(${sql.param(connectorNames)})`,
              ),
            ),
          ),
        params,
        updatedAtColumn: schema.connector_config.updated_at,
        idColumn: schema.connector_config.id,
      })

      const {items, total} = extractTotal(await query, 'connector_config')

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
          config: config ?? {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .returning()

      // Ensure config is null if it's an empty object
      if (ccfg && ccfg.config && Object.keys(ccfg.config).length === 0) {
        ccfg.config = null
      }

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

      validateResponse(res, id)
      const [ccfg] = res

      // Ensure config is null if it's an empty object
      if (ccfg && ccfg.config && Object.keys(ccfg.config).length === 0) {
        ccfg.config = null
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
