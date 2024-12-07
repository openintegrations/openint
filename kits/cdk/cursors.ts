import JsonURL from '@jsonurl/jsonurl'
import {z} from '@opensdks/util-zod'

const cursorFromSchema = <T>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  schema: z.ZodType<T, any>,
  defaultValue: T,
) => ({
  defaultValue,
  schema,
  serialize: (cur: T) => {
    try {
      return JsonURL.stringify(schema.parse(cur))
    } catch (err) {
      console.warn(`Serialize ${schema.description} cursor failed`, cur, err)
      return null
    }
  },
  deserialize: (str: string | null | undefined) => {
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
})

export const NextPageCursor = cursorFromSchema(
  z.object({next_page: z.number().positive()}),
  {next_page: 1},
)

// TODO: Return indication to caller that the cursor is invalid so that they can dynamically
// switch to a full sync rather than incremental sync
export const LastUpdatedAndIdCursor = cursorFromSchema(
  z.object({
    last_updated_at: z.string(),
    last_id: z.string(),
  }),
  undefined,
)

// TODO: Return indication to caller that the cursor is invalid so that they can dynamically
// switch to a full sync rather than incremental sync
export const LastUpdatedAndNextOffsetCursor = cursorFromSchema(
  z.union([
    z.object({
      last_updated_at: z.string(),
      // TODO: Rename to next_cursor from next_offset
      next_offset: z.string().nullish(),
    }),
    z.undefined(),
  ]),
  undefined,
)
