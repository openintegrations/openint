import {TRPCError} from '@trpc/server'
import {z} from 'zod'
import {defConnectors} from '@openint/all-connectors/connectors.def'
import {makeId} from '@openint/cdk'
import {and, eq, schema, sql} from '@openint/db'
import {makeUlid} from '@openint/util'
import {authenticatedProcedure, orgProcedure, router} from '../trpc/_base'
import {core} from '../models'
import {
  applyPaginationAndOrder,
  processPaginatedResponse,
  zListParams,
  zListResponse,
} from './utils/pagination'
import {zConnectorName} from './utils/types'

export const zExpandOptions = z
  .enum(['connector', 'enabled_integrations'])
  .describe(
    'Fields to expand: connector (includes connector details), enabled_integrations (includes enabled integrations details)',
  )

export function expandConnector(
  connectorConfig: z.infer<typeof core.connector_config>,
): Pick<
  z.infer<typeof core.connector>,
  'name' | 'display_name' | 'logo_url' | 'stage' | 'platforms'
> & {
  created_at: string
  updated_at: string
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
    // display_name: connectorConfig.display_name,
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
  connectorConfig: z.infer<typeof core.connector_config>,
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
                  'Invalid expand option. Valid options are: connector, enabled_integrations',
              },
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
      const {query, limit, offset} = applyPaginationAndOrder(
        ctx.db
          .select({
            connector_config: schema.connector_config,
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
      const expandOptions = input?.expand || []

      // Process items with proper typing
      const processedItems: z.infer<typeof connectorConfigWithRelations>[] =
        await Promise.all(
          items.map(async (ccfg) => {
            const result = {...ccfg} as z.infer<
              typeof connectorConfigWithRelations
            >

            if (expandOptions.includes('connector')) {
              const connector = expandConnector(ccfg)
              if (connector) {
                result.connector = connector
              }
            }

            if (expandOptions.includes('enabled_integrations')) {
              const filteredIntegrations = expandIntegrations(ccfg)

              if (filteredIntegrations && result.config) {
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
        // TODO: why is this unknown / any?
        config: z.record(z.unknown()).nullish(),
      }),
    )
    .output(core.connector_config)
    .mutation(async ({ctx, input}) => {
      const {connector_name} = input
      const [ccfg] = await ctx.db
        .insert(schema.connector_config)
        .values({
          org_id: ctx.viewer.orgId,
          id: makeId('ccfg', connector_name, makeUlid()),
          config: input.config,
        })
        .returning()
      return ccfg!
    }),
})
