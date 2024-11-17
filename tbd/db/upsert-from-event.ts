import {PgColumn, pgTable, unique, uniqueIndex} from 'drizzle-orm/pg-core'
import {z} from '@openint/util'

export function isValidDateString(str: string) {
  const date = new Date(str)
  const lenToCheck = Math.min(str.length, '2021-01-01T00:00:00'.length)
  return (
    !Number.isNaN(date.getTime()) &&
    date.toISOString().slice(0, lenToCheck) === str.slice(0, lenToCheck)
  )
}

/** Airbyte record message */
export const zRecordMessage = z.object({
  stream: z.string(),
  // Should we support non-record data?
  data: z.record(z.unknown()),
  namespace: z.string().optional(),
  upsert: z
    .object({
      insert_only_columns: z.array(z.string()).optional(),
      key_columns: z.array(z.string()).optional(),
      must_match_columns: z.array(z.string()).optional(),
      no_diff_columns: z.array(z.string()).optional(),
      shallow_merge_jsonb_columns: z.array(z.string()).optional(),
    })
    .optional(),
})

export type RecordMessage = z.infer<typeof zRecordMessage>

/**
 * We probably want something based off of the Catalog protocol, by inferring catalog
 * from data object and then generating a migration from the catalog message as a two step,
 * unified process.
 * For now we just do something lightweig thought
 */
export function inferTable(event: RecordMessage) {
  // TODO Implement namespace and upsert metadata support
  return pgTable(
    event.stream,
    (t) => {
      function inferCol(v: unknown) {
        if (typeof v === 'string') {
          return isValidDateString(v) ? t.timestamp() : t.text()
        }
        if (typeof v === 'number') {
          return Math.floor(v) === v ? t.integer() : t.doublePrecision()
        }
        if (typeof v === 'boolean') {
          return t.boolean()
        }
        if (v instanceof Date) {
          return t.timestamp()
        }
        return t.jsonb()
      }
      return Object.fromEntries(
        Object.entries(event.data).map(([k, v]) => [k, inferCol(v)]),
      )
    },
    (table) =>
      // TODO: Check against existing primary key and unique indexes
      // to not create if already there?
      // && Object.values(table).filter(c => c.i)
      event.upsert?.key_columns
        ? [
            uniqueIndex(`${event.stream}_upsert_keys`).on(
              ...(event.upsert.key_columns.map(
                (col) => table[col] as PgColumn,
              ) as [PgColumn]),
            ),
          ]
        : [],
  )
}
