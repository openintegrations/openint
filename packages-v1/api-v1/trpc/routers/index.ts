import {z} from 'zod'
import {zViewer} from '@openint/cdk'
import {Column, desc, schema} from '@openint/db'
import {publicProcedure, router, trpc} from '../_base'
import {connectionRouter} from './connection'
import {connectorConfigRouter} from './connectorConfig'
import {eventRouter} from './event'

const generalRouter = router({
  health: publicProcedure
    .meta({openapi: {method: 'GET', path: '/health'}})
    .input(z.void())
    .output(z.object({ok: z.boolean()}))
    .query(() => ({ok: true})),
  viewer: publicProcedure
    .meta({openapi: {method: 'GET', path: '/viewer'}})
    .input(z.void())
    .output(zViewer)
    .query(({ctx}) => ctx.viewer),
})

export const zListParams = z.object({
  limit: z.number().optional(),
  offset: z.number().optional(),
})

export function zListResponse<T extends z.ZodTypeAny>(itemSchema: T) {
  return z.object({
    items: z.array(itemSchema),
    total: z.number(),
    limit: z.number(),
    offset: z.number(),
  })
}

export const appRouter = trpc.mergeRouters(
  connectionRouter,
  connectorConfigRouter,
  eventRouter,
  generalRouter,
)

export function applyPaginationAndOrder<
  T extends {orderBy: Function; limit: Function; offset: Function},
  P extends {limit?: number; offset?: number} | undefined,
>(
  query: T,
  orderByColumn: Column<any, any, any> = schema.connection.created_at,
  params?: P,
  orderDirection: 'asc' | 'desc' = 'desc',
): {query: T; limit: number; offset: number} {
  // Process pagination parameters
  const limit = params?.limit ?? 50
  const offset = params?.offset ?? 0

  // Apply ordering
  let modifiedQuery = query.orderBy(
    orderDirection === 'desc' ? desc(orderByColumn) : orderByColumn,
  ) as T

  // Apply pagination
  modifiedQuery = modifiedQuery.limit(limit).offset(offset) as T

  return {query: modifiedQuery, limit, offset}
}

export async function processPaginatedResponse<T extends keyof typeof schema>(
  query: any,
  entityKey: T,
): Promise<{
  items: Array<(typeof schema)[T] extends {$inferSelect: infer U} ? U : never>
  total: number
}> {
  // note in future we can add db specific error handling here
  const result = await query
  const total = result.length > 0 ? Number(result[0]?.total ?? 0) : 0

  const items = result.map((r: any) => r[entityKey])

  return {
    items,
    total,
  }
}

export type AppRouter = typeof appRouter
