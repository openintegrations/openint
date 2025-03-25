import {z} from 'zod'
import {schema, sql} from '@openint/db'
import {core, Customer} from '../models'
import {adminProcedure, router} from '../trpc/_base'
import {
  applyPaginationAndOrder,
  processTypedPaginatedResponse,
  zListParams,
  zListResponse,
} from './utils/pagination'

const customerWithConnectionCount = core.customer.extend({
  connection_count: z.number(),
})

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
    .output(zListResponse(customerWithConnectionCount))
    .query(async ({ctx, input}) => {
      const {query, limit, offset} = applyPaginationAndOrder(
        ctx.db
          .select({
            id: schema.customer.id,
            org_id: schema.customer.org_id,
            created_at: schema.customer.created_at,
            updated_at: schema.customer.updated_at,
            metadata: schema.customer.metadata,
            connection_count: sql<number>`(
              SELECT COUNT(*) 
              FROM ${schema.connection} 
              WHERE ${schema.connection}.customer_id = ${schema.customer.id}
            )`,
            total: sql`count(*) over()`,
          })
          .from(schema.customer),
        schema.customer.created_at,
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
