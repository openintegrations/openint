import {TRPCError} from '@trpc/server'
import {z} from 'zod'
import type {CustomerId, Viewer} from '@openint/cdk'
import {makeJwtClient} from '@openint/cdk'
import {schema, sql} from '@openint/db'
import {getServerUrl} from '@openint/env'
import {core, Customer} from '../models'
import {orgProcedure, router} from '../trpc/_base'
import {
  applyPaginationAndOrder,
  processTypedPaginatedResponse,
  Query,
  zListParams,
  zListResponse,
} from './utils/pagination'
import {zConnectionId, zConnectorName, zCustomerId} from './utils/types'

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
  createMagicLink: orgProcedure
    .meta({
      openapi: {
        method: 'POST',
        path: '/customer/{customer_id}/magic-link',
        description: 'Create a magic link for connecting integrations',
        summary: 'Create Magic Link',
      },
    })
    .input(
      z.object({
        customer_id: zCustomerId.openapi({
          param: {in: 'path', name: 'customer_id'},
        }),
        validity_in_seconds: z
          .number()
          .optional()
          .default(2592000)
          .describe(
            'How long the magic link will be valid for (in seconds) before it expires',
          ),
        redirect_url: z
          .string()
          .optional()
          .describe(
            'Where to send user to after connect / if they press back button',
          ),
        connector_names: z
          .array(zConnectorName.describe(''))
          .optional()
          .default([])
          .describe('Filter integrations by connector names'),
        connection_id: zConnectionId
          .optional()
          .describe('The specific connection id to load'),
        theme: z
          .enum(['light', 'dark'])
          .optional()
          .default('light')
          .describe('Magic Link display theme'),
        view: z
          .enum(['manage', 'manage-deeplink', 'add', 'add-deeplink'])
          .default('add')
          .optional()
          .describe('Magic Link tab view to load in the connect magic link'),
      }),
    )
    .output(
      z.object({
        magic_link_url: z
          .string()
          .describe('The Connect magic link url to share with the user.'),
      }),
    )
    .mutation(async ({ctx, input}) => {
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

      const url = new URL('/connect/portal', getServerUrl(null))
      url.searchParams.set('token', token)

      if (input.redirect_url) {
        url.searchParams.set('redirectUrl', input.redirect_url)
      }

      if (input.connector_names) {
        const connectorNames = input.connector_names.map((name) => name.trim())
        url.searchParams.set('connectorNames', connectorNames.join(','))
      }

      if (input.connection_id) {
        url.searchParams.set('connectionId', input.connection_id)
      }

      if (input.theme) {
        url.searchParams.set('theme', input.theme)
      }

      if (input.view) {
        url.searchParams.set('view', input.view)
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
        description: 'Create an authentication token for a customer',
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
