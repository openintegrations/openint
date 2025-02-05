import {
  neon,
  neonConfig,
  NeonQueryPromise,
  Pool,
} from '@neondatabase/serverless'
import type {DrizzleConfig, SQL} from 'drizzle-orm'
import {sql} from 'drizzle-orm'
import {drizzle} from 'drizzle-orm/neon-http'
import ws from 'ws'
import {env} from '@openint/env'
import * as schema from './schema'

export * from 'drizzle-orm'
export * from './stripeNullByte'
export * from './upsert'
export {schema, drizzle, neon, neonConfig}

neonConfig.webSocketConstructor = ws // <-- this is the key bit

neonConfig.fetchEndpoint = (host) => {
  const [protocol, port] =
    host === 'db.localtest.me' ? ['http', 4444] : ['https', 443]
  return `${protocol}://${host}:${port}/sql`
}

export function getDb<
  TSchema extends Record<string, unknown> = Record<string, never>,
>(urlString: string, config?: DrizzleConfig<TSchema>) {
  const sql = neon(urlString)
  const db = drizzle(sql, {logger: !!env['DEBUG'], ...config})
  const pool = new Pool({connectionString: urlString})
  // TODO: // deal with e.g. re-connect
  pool.on('error', (err: any) => console.error('pool error', err))

  const url = new URL(urlString)
  if (env.DEBUG) {
    console.log('[db] host', url.host)
  }
  return {db, sql, pool}
}

export const {sql: pg, db} = getDb(env.DATABASE_URL, {schema})
export const neonSql = neon(env.DATABASE_URL)

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

export function applyLimitOffset(
  query: any,
  opts: {limit?: number; offset?: number; orderBy?: string; order?: string},
) {
  const order = opts.order ? ` ${opts.order}` : ''
  return neonSql`${query} ${opts.limit ? `LIMIT ${opts.limit}` : ''} ${
    opts.offset ? `OFFSET ${opts.offset}` : ''
  } ${opts.orderBy ? `ORDER BY ${opts.orderBy}` : ''} ${order}`
}
