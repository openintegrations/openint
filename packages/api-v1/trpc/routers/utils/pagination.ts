import type {Column, PgSelectBase} from '@openint/db'
import type {Z} from '@openint/util/zod-utils'

import {asc, desc, schema} from '@openint/db'
import {z} from '@openint/util/zod-utils'

/** TODO: Switch to cursor based pagination */
export const zListParams = z.object({
  limit: z
    .number()
    .int()
    .min(0)
    .max(500)
    .optional()
    .default(50)
    .describe('Limit the number of items returned'),
  offset: z
    .number()
    .int()
    .min(0)
    .optional()
    .default(0)
    .describe('Offset the items returned'),
})

export function zListResponse<T extends Z.ZodTypeAny>(itemSchema: T) {
  return z.object({
    items: z.array(itemSchema),
    total: z
      .number()
      .int()
      .min(0)
      .describe('Total number of items in the database for the organization'),
    limit: z
      .number()
      .int()
      .min(0)
      .describe('Limit the number of items returned'),
    offset: z.number().int().min(0).describe('Offset the items returned'),
  })
}

export function extractTotal<T extends {total: number}, K extends keyof T>(
  result: T[],
  entityKey: K,
): {items: Array<T[K]>; total: number} {
  const total = result[0]?.total ?? 0
  const items = result.map((r) => r[entityKey])

  return {
    items,
    total,
  }
}

export function applyPaginationAndOrder2<
  T extends {orderBy: Function; limit: Function; offset: Function},
  P extends {limit?: number; offset?: number} | undefined,
>(opts: {
  query: T
  /** Column to order by, useful for syncing data */
  updatedAtColumn?: Column<any, any, any>
  /** Column to order by, useful for syncing data */
  idColumn?: Column<any, any, any>
  /** Pagination parameters */
  params?: P
}): {query: T; limit: number; offset: number} {
  // Process pagination parameters
  const limit = opts.params?.limit ?? 50
  const offset = opts.params?.offset ?? 0

  let query = opts.query

  if (opts.updatedAtColumn) {
    query = query.orderBy(desc(opts.updatedAtColumn)) as T
  }

  if (opts.idColumn) {
    query = query.orderBy(asc(opts.idColumn)) as T
  }

  // Apply pagination
  query = query.limit(limit).offset(offset) as T

  return {query, limit, offset}
}

// MARK: - Deprecated, use functions above instead

/** @deprecated Use applyPaginationAndOrder2 instead */
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

  // TODO: reenable pagination once we handle it in our clients
  if (params?.limit) {
    modifiedQuery = modifiedQuery.limit(limit).offset(offset) as T
  }

  return {query: modifiedQuery, limit, offset}
}

/** @deprecated Use extractTotal instead */
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

export type Query = Omit<
  PgSelectBase<string, Record<string, string | null>, 'partial'>,
  'where' | 'groupBy'
>

/** @deprecated Use extractTotal instead */
export async function processTypedPaginatedResponse<T>(query: Query): Promise<{
  items: T[]
  total: number
}> {
  const result = await query
  const total = result.length
  const items = result.map((r) => r as T)

  return {
    items,
    total,
  }
}
