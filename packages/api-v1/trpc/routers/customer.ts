import type {Customer} from '../../models'
import type {Query} from './utils/pagination'

import {schema, sql} from '@openint/db'
import {z} from '@openint/util/zod-utils'
import {orgProcedure, router} from '../_base'
import {core} from '../../models/core'
import {
  applyPaginationAndOrder,
  processTypedPaginatedResponse,
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
          keywords: z.string().trim().nullish(),
        })
        .default({}),
    )
    .output(
      zListResponse(
        core.customer_select.extend({connection_count: z.number()}),
      ),
    )
    .query(async ({ctx, input}) => {
      const baseQuery = ctx.db
        .select({
          id: schema.connection.customer_id,
          connection_count: sql<number>`cast(count(*) AS integer)`,
          created_at: sql<string>`min(${schema.connection.created_at})`,
          updated_at: sql<string>`max(${schema.connection.updated_at})`,
        })
        .from(schema.connection)
        .where(
          input?.keywords
            ? sql`
                ${schema.connection.customer_id} ILIKE ${`%${input.keywords}%`}
              `
            : undefined,
        )
        .groupBy(schema.connection.customer_id, schema.connection.created_at)

      const {query, limit, offset} = applyPaginationAndOrder(
        baseQuery,
        schema.connection.created_at,
        input,
      )

      const {items, total} = await processTypedPaginatedResponse<Customer>(
        query as unknown as Query,
      )

      return {
        items: items.filter(
          (item): item is Customer & {connection_count: number} =>
            item.id !== null,
        ),
        total,
        limit,
        offset,
      }
    }),
})
