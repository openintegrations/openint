import {z} from 'zod'
import {Column, desc, schema} from '@openint/db'

export const zListParams = z.object({
  limit: z
    .number()
    .int()
    .min(0)
    .max(100)
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

export function zListResponse<T extends z.ZodTypeAny>(itemSchema: T) {
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
      .nonnegative()
      .max(100)
      .default(50)
      .describe('Limit the number of items returned'),
    offset: z
      .number()
      .int()
      .min(0)
      .default(0)
      .describe('Offset the items returned'),
  })
}
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

export async function processTypedPaginatedResponse<T>(query: any): Promise<{
  items: Array<T extends {$inferSelect: infer U} ? U : never>
  total: number
}> {
  // note in future we can add db specific error handling here
  const result = await query
  const total = result.length > 0 ? Number(result[0]?.total ?? 0) : 0

  const items = result.map(
    (r: any) => r as T extends {$inferSelect: infer U} ? U : never,
  )

  return {
    items,
    total,
  }
}
