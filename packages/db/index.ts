import {neon, neonConfig} from '@neondatabase/serverless'
import type {DrizzleConfig} from 'drizzle-orm'
import {sql} from 'drizzle-orm'
import {drizzle} from 'drizzle-orm/neon-http'
import ws from 'ws'
import {env} from '@openint/env'
import {makeJwtClient, Viewer} from '../../kits/cdk'
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

export async function getDb<
  TSchema extends Record<string, unknown> = Record<string, never>,
>(viewer: Viewer = {role: 'anon'}, config?: DrizzleConfig<TSchema>) {
  if (!env.JWT_PRIVATE_KEY) {
    throw new Error('JWT_PRIVATE_KEY is not set')
  }
  // NOTE: we currently sign on every DB request as we don't want to rotate organization API keys.
  // this may have performance implications.
  const start = performance.now()
  const jwt = makeJwtClient({
    secretOrPrivateKey: env.JWT_PRIVATE_KEY,
    publicKey: env.NEXT_PUBLIC_JWT_PUBLIC_KEY,
  })
  // TODO: ensure this works with ES256 or RS256
  const authToken = await jwt.signViewer(viewer)
  const duration = performance.now() - start
  console.warn(`[db] db JWT signing took ${duration.toFixed(2)}ms`)

  // TODO: make this AUTHENTICATED_DATABASE URL if viewer of type org or user.
  // Pending creating it on Neon
  const sql = neon(env.DATABASE_URL, {authToken})
  const url = new URL(env.DATABASE_URL)

  const db = drizzle(sql, {logger: !!env['DEBUG'], ...config})

  if (env.DEBUG) {
    console.log('[db] host', url.host)
  }
  return {db, sql}
}

export async function ensureSchema(
  thisDb: Awaited<ReturnType<typeof getDb>>['db'],
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
  return sql`${query} ${opts.limit ? `LIMIT ${opts.limit}` : ''} ${
    opts.offset ? `OFFSET ${opts.offset}` : ''
  } ${opts.orderBy ? `ORDER BY ${opts.orderBy}` : ''} ${order}`
}
