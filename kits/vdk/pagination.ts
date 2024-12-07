import {extendZodWithOpenApi, z} from '@opensdks/util-zod'

export * from '@openint/cdk/cursors'

export const zPaginationParams = z.object({
  sync_mode: z
    .enum(['full', 'incremental'])
    .optional()
    .describe(
      'Used for syncing data and impacts return value of cursor.' +
        ' When not specified it is up to each provider to decide the default.' +
        ' Sometimes it will have no effect if a provider only supports one mode',
    ),
  cursor: z.string().nullish(),
  page_size: z.number().optional(),
})
export type Pagination = z.infer<typeof zPaginationParams>

export const zPaginatedResult = z.object({
  next_cursor: z.string().nullish(),
  has_next_page: z.boolean(),
})

export type PaginatedOutput<T extends {}> = z.infer<
  ReturnType<typeof paginatedOutput<z.ZodObject<any, any, any, T>>>
>
export function paginatedOutput<ItemType extends z.AnyZodObject>(
  itemSchema: ItemType,
) {
  return z.object({
    has_next_page: z.boolean(),
    items: z.array(itemSchema.extend({_original: z.unknown()})),
  })
}

// cursor pagination
// offset increment pagination
// updated_since + id ideally
// page increment pagination

// TODO: Move these out to a separate file

export const zBaseRecord = z.object({
  id: z.string(),
  /** z.string().datetime() does not work for simple things like `2023-07-19T23:46:48.000+0000`  */
  updated_at: z.string().describe('ISO8601 date string'),
  raw_data: z.record(z.unknown()).optional(),
})

export type BaseRecord = z.infer<typeof zBaseRecord>

// HACK ALERt: For whatever reason calling .openapi here causes issue, @see https://gist.github.com/tonyxiao/0b078ab06411dc29fc3248892956887f
// Therefore we explicitly call extendZodWithOpenApi(z) again to make sure it is called beforehand.
// Perhaps next.js re-orders imports & side effects in a way that causes this issue when building for production
extendZodWithOpenApi(z)
export const zWarning = z
  .object({
    title: z.string().optional(),
    problem_type: z.string().optional(),
    detail: z.string().optional(),
  })
  .openapi({ref: 'warning'})

export function withWarnings<T extends z.ZodRawShape>(shape: T) {
  return z.object({
    ...shape,
    warnings: z.array(zWarning).optional(),
  })
}
