import {TRPCError} from '@trpc/server'
import {schema, sql} from '@openint/db'
import {z} from '@openint/util/zod-utils'
import {asCustomerOfOrg, makeJwtClient} from '../lib/makeJwtClient'
import type {Customer} from '../models'
import {core} from '../models'
import {orgProcedure, router} from '../trpc/_base'
import type {Query} from './utils/pagination'
import {
  applyPaginationAndOrder,
  processTypedPaginatedResponse,
  zListParams,
  zListResponse,
} from './utils/pagination'
import {zCustomerId} from './utils/types'

export const customerRouter = router({
  createToken: orgProcedure
    .meta({
      openapi: {
        method: 'POST',
        path: '/customer/{customer_id}/token',
        description:
          'Create a @Connect authentication token for a customer. This token can be used to embed @Connect in your application via the `@openint/connect` npm package.',
        summary: 'Create Customer Authentication Token',
      },
    })
    .input(
      z
        .object({
          customer_id: zCustomerId.openapi({
            param: {in: 'path', name: 'customer_id'},
          }),
          validity_in_seconds: z
            .number()
            .positive()
            .optional()
            .default(2592000)
            .describe(
              'How long the token will be valid for (in seconds) before it expires',
            ),
        })
        .nullish(),
    )
    .output(
      z.object({
        token: z
          .string()
          .describe('The authentication token to use for API requests'),
      }),
    )
    .mutation(async ({ctx, input}) => {
      const jwt = makeJwtClient({
        secretOrPublicKey: process.env['JWT_SECRET']!,
      })

      if (!input || !input.customer_id) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Missing customer_id in path /customer/{customer_id}/token',
        })
      }

      const token = await jwt.signViewer(
        asCustomerOfOrg(ctx.viewer, {customerId: input.customer_id as any}),
        {validityInSeconds: input.validity_in_seconds},
      )

      return {
        token: token,
      }
    }),
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
        .optional(),
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
          connection_count: sql<number>`cast(count(*) as integer)`,
          created_at: sql<string>`min(${schema.connection.created_at})`,
          updated_at: sql<string>`max(${schema.connection.updated_at})`,
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

      const res = await query

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
