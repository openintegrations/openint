import type {DrizzleConfig, SQL} from 'drizzle-orm'
import {sql} from 'drizzle-orm'
import {drizzle} from 'drizzle-orm/node-postgres'
import {migrate} from 'drizzle-orm/node-postgres/migrator'
import {env} from '@openint/env'
import * as schema from './schema'
import * as schemaWip from './schema-wip'

export * from 'drizzle-orm'
export * from './schema-dynamic'
export * from './stripeNullByte'
export * from './upsert'
export {drizzle, migrate, schema, schemaWip}

export function getDb<
  TSchema extends Record<string, unknown> = Record<string, never>,
>(urlString: string, config?: DrizzleConfig<TSchema>) {
  // const pg = postgres(urlString)
  const db = drizzle(urlString, {logger: !!env['DEBUG'], ...config})

  const url = new URL(urlString)
  if (env.DEBUG) {
    console.log('[db] host', url.host)
  }

  return {db, pg: {end: () => {}}}
}

export const {pg: configPg, db: configDb} = getDb(env.POSTGRES_URL, {
  schema: schemaWip,
})

export async function ensureSchema(
  thisDb: ReturnType<typeof getDb>['db'],
  schema: string,
) {
  // Check existence first because we may not have permission to actually create the schema
  const exists = await thisDb
    .execute(
      sql`SELECT true as exists FROM information_schema.schemata WHERE schema_name = ${schema}`,
    )
    .then((r) => r.rows?.[0]?.['exists'] === true)
  if (exists) {
    return
  }
  await thisDb.execute(
    sql`CREATE SCHEMA IF NOT EXISTS ${sql.identifier(schema)};`,
  )
}

/** Will close the postgres client connection by default */
export async function runMigration(opts?: {keepAlive?: boolean}) {
  console.log('[db] Running migrations...')
  const path = await import('node:path')
  // const fs = await import('node:fs')
  // const url = await import('node:url')

  const schema = env['POSTGRES_SCHEMA']
  if (schema) {
    await ensureSchema(configDb, schema)
    await configDb.execute(sql`
      SET search_path TO ${sql.identifier(schema)};
    `)
  }

  // const __filename = url.fileURLToPath(import.meta.url)
  // const __dirname = path.dirname(__filename)
  await migrate(configDb, {
    migrationsFolder: path.join(__dirname, 'migrations'),
    // Seems to have no impact, and unconditionally creates a drizzle schema... 🤔
    // migrationsTable: '_migrations',
  })

  if (!opts?.keepAlive) {
    await configPg.end()
  }
}

export function applyLimitOffset<T>(
  query: SQL<T>,
  opts: {limit?: number; offset?: number},
) {
  const limit = opts.limit ? sql` LIMIT ${opts.limit}` : sql``
  const offset = opts.offset ? sql` OFFSET ${opts.offset}` : sql``
  return sql<T>`${query}${limit}${offset}`
}
