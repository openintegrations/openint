import {pgTable} from 'drizzle-orm/pg-core'

export function isValidDateString(str: string) {
  const date = new Date(str)
  const lenToCheck = Math.min(str.length, '2021-01-01T00:00:00'.length)
  return (
    !Number.isNaN(date.getTime()) &&
    date.toISOString().slice(0, lenToCheck) === str.slice(0, lenToCheck)
  )
}

/**
 * We probably want something based off of the Catalog protocol, by inferring catalog
 * from data object and then generating a migration from the catalog message as a two step,
 * unified process.
 * For now we just do something lightweig thought
 */
export function inferTable(event: {
  stream: string
  data: Record<string, unknown>
  // TODO Implement namespace and upsert metadata support
}) {
  return pgTable(event.stream, (t) => {
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
  })
}
