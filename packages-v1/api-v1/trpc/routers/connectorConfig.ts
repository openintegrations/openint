import {z} from 'zod'
import {count, desc, eq, schema, SQL} from '@openint/db'
import {zListParams, zListResponse} from '.'
import {authenticatedProcedure, router} from '../_base'
import {core} from '../../models'

export const connectorConfigRouter = router({
  listConnectorConfigs: authenticatedProcedure
    .meta({
      openapi: {method: 'GET', path: '/connector-config'},
    })
    .input(
      zListParams
        .extend({
          // TODO: make this a valid connector_name instead of string
          connector_name: z.string().optional(),
        })
        .optional(),
    )
    .output(zListResponse(core.connector_config))
    .query(async ({ctx, input}) => {
      const limit = input?.limit ?? 50
      const offset = input?.offset ?? 0

      const whereConditions: SQL<unknown>[] = []

      if (input?.connector_name) {
        whereConditions.push(
          eq(schema.connector_config.connector_name, input?.connector_name),
        )
      }

      const whereClause =
        whereConditions.length > 0
          ? whereConditions.reduce(
              (acc, condition) => {
                if (acc === true) return condition
                return acc && condition
              },
              true as boolean | SQL<unknown>,
            )
          : undefined

      // Use a single query with COUNT(*) OVER() to get both results and total count
      const result = await ctx.db
        .select({
          connector_config: schema.connector_config,
          total: count(),
        })
        .from(schema.connector_config)
        .where(whereClause as SQL<unknown>)
        .orderBy(desc(schema.connector_config.created_at))
        .limit(limit)
        .offset(offset)

      const connectorConfigs = result.map((r) => r.connector_config)
      const total = result.length > 0 ? Number(result[0]?.total ?? 0) : 0

      return {
        items: connectorConfigs,
        total,
        limit,
        offset,
      }
    }),
})
