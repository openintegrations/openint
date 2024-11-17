import {pgTable} from 'drizzle-orm/pg-core'

export function isValidDateString(str: string) {
  const date = new Date(str)
  const lenToCheck = Math.min(str.length, '2021-01-01T00:00:00'.length)
  return (
    !Number.isNaN(date.getTime()) &&
    date.toISOString().slice(0, lenToCheck) === str.slice(0, lenToCheck)
  )
}

export function inferTable(tableName: string, data: Record<string, unknown>) {
  return pgTable(tableName, (t) => {
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
      Object.entries(data).map(([k, v]) => [k, inferCol(v)]),
    )
  })
}
