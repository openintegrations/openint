import {TRPCError} from '@trpc/server'
import {z} from 'zod'
import {defConnectors} from '@openint/all-connectors/connectors.def'
import {makeId} from '@openint/cdk'
import {and, eq, schema, sql} from '@openint/db'
import {makeUlid} from '@openint/util'
import {Core, core} from '../models'
import {authenticatedProcedure, orgProcedure, router} from '../trpc/_base'
import {
  applyPaginationAndOrder,
  processPaginatedResponse,
  zListParams,
  zListResponse,
} from './utils/pagination'
import {zConnectorName} from './utils/types'

const validateResponse = (res: Array<Core['connector_config']>, id: string) => {
  if (!res.length) {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: `Connector config with ID "${id}" not found`,
    })
  }
}

export const zExpandOptions = z
  .enum(['connector', 'enabled_integrations', 'connection_count'])
  .describe(
    'Fields to expand: connector (includes connector details), enabled_integrations (includes enabled integrations details)',
  )

export function expandConnector(
  connectorConfig: Core['connector_config'],
): Pick<
  Core['connector'],
  'name' | 'display_name' | 'logo_url' | 'stage' | 'platforms'
> & {
  created_at: string
  updated_at: string
  disabled: boolean
} {
  const connectorName = connectorConfig.connector_name

  const connector = defConnectors[connectorName as keyof typeof defConnectors]
  if (!connector) {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: `Connector not found: ${connectorName}`,
    })
  }

  const logoUrl =
    connector.metadata &&
    'logoUrl' in connector.metadata &&
    connector.metadata.logoUrl?.startsWith('http')
      ? connector.metadata.logoUrl
      : connector.metadata && 'logoUrl' in connector.metadata
        ? // TODO: replace this with our own custom domain
          `https://cdn.jsdelivr.net/gh/openintegrations/openint@main/apps/web/public/${connector.metadata.logoUrl}`
        : undefined

  return {
    // TODO: add more fields?
    name: connectorName,
    // TODO: add display_name?
    display_name: connectorConfig.display_name ?? undefined,
    disabled: connectorConfig.disabled ?? false,
    // TODO: add enabled?
    // enabled: connectorConfig.enabled,
    created_at: connectorConfig.created_at,
    updated_at: connectorConfig.updated_at,
    logo_url: logoUrl,
  }
}

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
        description: 'List all connector configurations',
        summary: 'List Connector Configurations',
      },
    })
    .input(
      zListParams
        .extend({
          expand: z
            .string()
            .transform((val) => val.split(','))
            .refine(
              (items) =>
                items.every((item) => zExpandOptions.safeParse(item).success),
              {
                message:
                  'Invalid expand option. Valid options are: connector, enabled_integrations, connection_count',
              },
            )
            .describe(
              'Comma separated list of fields to optionally expand.\n\nAvailable Options: `connector`, `enabled_integrations`',
            )
            .optional(),
          connector_name: zConnectorName.optional(),
        })
        .optional(),
    )
    .output(
      zListResponse(connectorConfigWithRelations).describe(
        'The list of connector configurations',
      ),
    )
    .query(async ({ctx, input}) => {
      const includeConnectionCount = (input?.expand || []).includes(
        'connection_count',
      )
      const {query, limit, offset} = applyPaginationAndOrder(
        ctx.db
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
            total: sql`count(*) over ()`,
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
      const expandOptions = (input?.expand || []) as Array<
        z.infer<typeof zExpandOptions>
      >

      // Process items with proper typing
      const processedItems: Array<
        z.infer<typeof connectorConfigWithRelations>
      > = await Promise.all(
        items.map(async (ccfg) => {
          const result = {...ccfg} as z.infer<
            typeof connectorConfigWithRelations
          >

          if (result.config && Object.keys(result.config).length === 0) {
            result.config = null
          }

          // Convert connection_count to number if it exists
          if (includeConnectionCount && 'connection_count' in result) {
            result.connection_count = Number(result.connection_count || 0)
          }

          if (expandOptions.includes('connector')) {
            const connector = expandConnector(ccfg)
            if (connector) {
              result.connector = connector
            }
          }

          if (expandOptions.includes('enabled_integrations')) {
            const filteredIntegrations = expandIntegrations(ccfg)

            if (filteredIntegrations) {
              result.integrations = filteredIntegrations
            }
          }

          return result
        }),
      )

      return {
        items: processedItems,
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
        id: z.string(),
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
      console.log({input})
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

      console.log('updated ccfg', res)

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
    .input(z.object({id: z.string()}))
    .output(z.string())
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

      return id
    }),
})
