import {z} from 'zod'
import {makeId} from '@openint/cdk'
import {and, eq, schema, sql} from '@openint/db'
import {makeUlid} from '@openint/util'
import {authenticatedProcedure, orgProcedure, router} from '../_base'
import {core} from '../../models'
import {
  expandConnector,
  expandIntegrations,
  zConnectorName,
  zExpandOptions,
} from '../utils/connectorUtils'
import {
  applyPaginationAndOrder,
  processPaginatedResponse,
  zListParams,
  zListResponse,
} from '../utils/pagination'

type ExpandedConnectorConfig = z.infer<typeof core.connector_config> & {
  connector?: any
  integrations?: Record<string, any>
}

export const connectorConfigRouter = router({
  listConnectorConfigs: authenticatedProcedure
    .meta({
      openapi: {
        method: 'GET',
        path: '/connector-config',
        description:
          'List all connector configurations with optional filtering',
        summary: 'List Connector Configurations',
      },
    })
    .input(
      zListParams
        .extend({
          expand: z.array(zExpandOptions).optional().default([]),
          connector_name: zConnectorName.optional(),
        })
        .optional(),
    )
    .output(
      zListResponse(core.connector_config).describe(
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

      // Process items with proper typing
      const processedItems: ExpandedConnectorConfig[] = await Promise.all(
        items.map(async (ccfg) => {
          const result = {...ccfg} as ExpandedConnectorConfig

          if (input?.expand?.includes('connector')) {
            result.connector = await expandConnector(ccfg)
          }

          if (input?.expand?.includes('integrations')) {
            const filteredIntegrations = expandIntegrations(ccfg)

            if (filteredIntegrations && result.config) {
              result.config.integrations = filteredIntegrations
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
      openapi: {method: 'POST', path: '/connector-config'},
    })
    .input(
      z.object({
        connector_name: z.string(),
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
