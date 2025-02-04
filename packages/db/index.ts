import {neon, neonConfig, Pool} from '@neondatabase/serverless'
import type {DrizzleConfig, SQL} from 'drizzle-orm'
import {sql} from 'drizzle-orm'
import {drizzle} from 'drizzle-orm/neon-http'
import {env} from '@openint/env'
import * as schema from './schema'

export * from 'drizzle-orm'
export * from './stripeNullByte'
export * from './upsert'
export {schema, drizzle, neon}

neonConfig.fetchEndpoint = (host) => {
  const [protocol, port] =
    host === 'db.localtest.me' ? ['http', 4444] : ['https', 443]
  return `${protocol}://${host}:${port}/sql`
}

export function getDb<
  TSchema extends Record<string, unknown> = Record<string, never>,
>(urlString: string, config?: DrizzleConfig<TSchema>) {
  // Create both pool and drizzle instances
  const pool = new Pool({connectionString: urlString})
  pool.on('error', (err) => console.error('[db pool error]', err))

  const sql = neon(urlString)
  const db = drizzle(sql, {logger: !!env['DEBUG'], ...config})

  const url = new URL(urlString)
  if (env.DEBUG) {
    console.log('[db] host', url.host)
  }
  return {db, sql, pool}
}

export const {sql: pg, db} = getDb(env.DATABASE_URL, {schema})

export async function ensureSchema(
  thisDb: ReturnType<typeof getDb>['db'],
  schema: string,
) {
  // Check existence first because we may not have permission to actually create the schema
  const exists = await thisDb
    .execute(
      sql`SELECT true as exists FROM information_schema.schemata WHERE schema_name = ${schema}`,
    )
    .then((r) => r.rows[0]?.['exists'] === true)
  if (exists) {
    return
  }
  await thisDb.execute(
    sql`CREATE SCHEMA IF NOT EXISTS ${sql.identifier(schema)};`,
  )
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
