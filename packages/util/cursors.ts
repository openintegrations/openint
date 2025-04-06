import JsonURL from '@jsonurl/jsonurl'
import {z, type Z} from './zod-utils'

const cursorFromSchema = <T>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  schema: Z.ZodType<T, any>,
  defaultValue: T,
) => ({
  defaultValue,
  serialize: (cur: T) => {
    try {
      return JsonURL.stringify(schema.parse(cur))
    } catch (err) {
      console.warn(`Serialize ${schema.description} cursor failed`, cur, err)
      return null
    }
  },
  deserialize: (str: string | null | undefined) => {
    // console.log('deserialize', {
    //   str,
    //   'JsonURL.parse(str)': JsonURL.parse(str!),
    //   'schema.parse(JsonURL.parse(str))': schema.parse(JsonURL.parse(str!)),
    // })
    if (str == null) {
      return defaultValue
    }
    try {
      return schema.parse(JsonURL.parse(str))
    } catch (err) {
      console.warn(`Deserialize ${schema.description} cursor failed`, str, err)
      return defaultValue
    }
  },
  schema,
})

export const NextPageCursor = cursorFromSchema(
  z.object({next_page: z.number().positive()}),
  {next_page: 1},
)

// TODO: Return indication to caller that the cursor is invalid so that they can dynamically
// switch to a full sync rather than incremental sync
export const LastUpdatedAndIdCursor = cursorFromSchema(
  z
    .object({
      last_updated_at: z.string(),
      last_id: z.string(),
    })
    .optional(),
  undefined,
)

// TODO: Return indication to caller that the cursor is invalid so that they can dynamically
// switch to a full sync rather than incremental sync
export const LastUpdatedAndNextOffsetCursor = cursorFromSchema(
  z
    .object({
      last_updated_at: z.string(),
      // TODO: Rename to next_cursor from next_offset
      next_offset: z.string().nullish(),
    })
    .optional(),
  undefined,
)

export const LastUpdatedAndPage = cursorFromSchema(
  z
    .object({
      last_updated_at: z.string().nullish(),
      page: z.number(),
      pending_last_updated_at: z.string().nullish(),
    })
    .optional(),
  undefined,
)
