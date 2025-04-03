import {TRPCError} from '@trpc/server'
import type {CustomerId, Viewer} from '@openint/cdk'
import {makeJwtClient} from '@openint/cdk'
import {schema, sql} from '@openint/db'
import {getServerUrl} from '@openint/env'
import {z} from '@openint/util/zod-utils'
import {core, Customer} from '../models'
import {orgProcedure, router} from '../trpc/_base'
import {customerRouterModels} from './customer.models'
import {
  applyPaginationAndOrder,
  processTypedPaginatedResponse,
  Query,
  zListParams,
  zListResponse,
} from './utils/pagination'
import {zCustomerId} from './utils/types'

function asCustomer(
  viewer: Viewer,
  input: {customerId?: CustomerId | null},
): Viewer<'customer'> {
  if (!('orgId' in viewer) || !viewer.orgId) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'Current viewer missing orgId to create token',
    })
  }
  if (
    viewer.role === 'customer' &&
    input.customerId &&
    input.customerId !== viewer.customerId
  ) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Current viewer cannot create token for other customer',
    })
  }
  const customerId =
    viewer.role === 'customer' ? viewer.customerId : input.customerId
  if (!customerId) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'Either call as an customer or pass customerId explicitly',
    })
  }

  return {role: 'customer', customerId, orgId: viewer.orgId}
}

export const customerRouter = router({
  getMagicLink: orgProcedure
    .meta({
      openapi: {
        method: 'POST',
        path: '/customer/{customer_id}/magic-link',
        description:
          'Create a magic link that is ready to be shared with customers who want to use Connect',
        summary: 'Create Magic Link',
      },
    })
    .input(customerRouterModels.getMagicLinkInput)
    .output(
      z.object({
        magic_link_url: z
          .string()
          .describe('The Connect magic link url to share with the user.'),
      }),
    )
    .query(async ({ctx, input}) => {
      // TODO: replace with new signing and persisting mechanism
      const jwt = makeJwtClient({
        secretOrPublicKey: process.env['JWT_SECRET']!,
      })
      const token = await jwt.signViewer(
        asCustomer(ctx.viewer, {customerId: input.customer_id as any}),
        {
          validityInSeconds: input.validity_in_seconds,
        },
      )

      const url = new URL('/connect', getServerUrl(null))
      url.searchParams.set('token', token)

      if (input.client_options) {
        for (const [key, value] of Object.entries(input.client_options)) {
          if (value !== undefined) {
            url.searchParams.set(key, value.toString())
          }
        }
      }

      return {
        magic_link_url: url.toString(),
      }
    }),
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
      z.object({
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
      }),
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

      const token = await jwt.signViewer(
        asCustomer(ctx.viewer, {customerId: input.customer_id as any}),
        {
          validityInSeconds: input.validity_in_seconds,
        },
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
    .output(zListResponse(core.customer))
    .query(async ({ctx, input}) => {
      const baseQuery = ctx.db
        .select({
          id: schema.connection.customer_id,
          connection_count: sql<number>`cast(count(*) as integer)`,
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

      const {items, total} = await processTypedPaginatedResponse<Customer>(
        query as unknown as Query,
      )

      return {
        items,
        total,
        limit,
        offset,
      }
    }),
})
