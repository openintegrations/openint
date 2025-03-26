import {z} from 'zod'
import {schema, sql} from '@openint/db'
import {core, type Customer} from '../models'
import {adminProcedure, router} from '../trpc/_base'
import {
  applyPaginationAndOrder,
  processTypedPaginatedResponse,
  zListParams,
  zListResponse,
} from './utils/pagination'

export const adminRouter = router({
  listCustomers: adminProcedure
    .meta({
      openapi: {
        method: 'GET',
        path: '/customers',
        description: 'List all customers',
        summary: 'List Customers',
      },
    })
    .input(
      zListParams
        .extend({
          keywords: z.string().trim().nullish(),
        })
        .optional(),
    )
    .output(zListResponse(core.customer))
    .query(async ({ctx, input}) => {
      const baseQuery = ctx.db
        .select({
          id: schema.connection.customer_id,
          connection_count: sql<number>`count(*)`,
          created_at: sql<Date>`min(${schema.connection.created_at})`,
          updated_at: sql<Date>`max(${schema.connection.updated_at})`,
        })
        .from(schema.connection)
        .where(
          input?.keywords
            ? sql`${schema.connection.customer_id} ILIKE ${`%${input.keywords}%`}`
            : undefined,
        )
        .groupBy(schema.connection.customer_id, schema.connection.created_at)

      const {query, limit, offset} = applyPaginationAndOrder(
        baseQuery,
        schema.connection.created_at,
        input,
      )

      const {items, total} =
        await processTypedPaginatedResponse<Customer>(query)

      return {
        items,
        total,
        limit,
        offset,
      }
    }),
})
