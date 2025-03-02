import type {SQL} from 'drizzle-orm'
import {sql} from 'drizzle-orm'
import {type Database} from './db'
import * as schema from './schema'

export * from 'drizzle-orm'
export * from './stripeNullByte'
export * from './upsert'
export {schema}

export async function ensureSchema(thisDb: Database, schema: string) {
  // Check existence first because we may not have permission to actually create the schema
  const exists = await thisDb
    .exec(
      sql`SELECT true as exists FROM information_schema.schemata WHERE schema_name = ${schema}`,
    )
    .then((r) => r.rows[0]?.['exists'] === true)

  if (exists) {
    return
  }
  await thisDb.exec(sql`CREATE SCHEMA IF NOT EXISTS ${sql.identifier(schema)};`)
}

export function applyLimitOffset<T>(
  query: SQL<T>,
  opts: {limit?: number; offset?: number; orderBy?: string; order?: string},
) {
  const limit = opts.limit ? sql` LIMIT ${opts.limit}` : sql``
  const offset = opts.offset ? sql` OFFSET ${opts.offset}` : sql``
  const orderBy = opts.orderBy ? sql` ORDER BY ${opts.orderBy}` : sql``
  const order = opts.order ? sql` ${opts.order}` : sql``
  return sql<T>`${query}${limit}${offset}${orderBy}${order}`
}
