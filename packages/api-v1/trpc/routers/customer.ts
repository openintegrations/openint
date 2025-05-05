import {ilike, or, schema, sql} from '@openint/db'
import {z} from '@openint/util/zod-utils'
import {orgProcedure, router} from '../_base'
import {
  formatListResponse,
  zListParams,
  zListResponse,
} from './utils/pagination'

export const customerRouter = router({
  listCustomers: orgProcedure
    .meta({
      openapi: {
        method: 'GET',
        path: '/customers',
        description: 'List all customers',
        summary: 'List Customers',
        enabled: false,
      },
    })
    .input(
      zListParams
        .extend({
          search_query: z.string().trim().nullish(),
        })
        .default({}),
    )
    .output(
      zListResponse(
        // core.customer_select.extend({connection_count: z.number()}),
        z.object({
          id: z.string().nullable().describe('Customer Id'),
          connection_count: z.number(),
          created_at: z
            .string()
            .describe('postgres timestamp format, not yet ISO'),
          updated_at: z
            .string()
            .describe('postgres timestamp format, not yet ISO'),
        }),
      ),
    )
    .query(async ({ctx, input: {offset, limit, search_query}}) => {
      // Lowercased query for case insensitive search
      const lowerQuery = search_query?.toLowerCase()
      const res = await ctx.db
        .select({
          id: schema.connection.customer_id,
          connection_count: sql<number>`cast(count(*) AS integer)`,
          created_at: sql<string>`min(${schema.connection.created_at})`,
          updated_at: sql<string>`max(${schema.connection.updated_at})`,
          total: sql<number>`count(*) OVER ()`.as('total'),
        })
        .from(schema.connection)
        .where(
          lowerQuery
            ? or(
                ilike(schema.connection.customer_id, `%${lowerQuery}%`),
                ilike(schema.connection.connector_name, `%${lowerQuery}%`),
              )
            : undefined,
        )
        .groupBy(schema.connection.customer_id)
        .offset(offset)
        .limit(limit)

      return formatListResponse(res, {limit, offset})
    }),
})
