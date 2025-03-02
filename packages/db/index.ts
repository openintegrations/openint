import {neon, neonConfig} from '@neondatabase/serverless'
import type {SQL} from 'drizzle-orm'
import {sql} from 'drizzle-orm'
import {drizzle as drizzleProxy} from 'drizzle-orm/pg-proxy'
import type {Viewer} from '@openint/cdk'
import {env} from '@openint/env'
import * as schema from './schema'

export * from 'drizzle-orm'
export * from './stripeNullByte'
export * from './upsert'
export {schema}

neonConfig.fetchEndpoint = (host) => {
  // localhost does not work because neon proxy expects to work with SNI and would result in error
  // invalid hostname: Common name inferred from SNI ('localhost') is not known
  // Therefore we need to use db.localtest.me as an alternative.
  // to work completely offline, add to `/etc/hosts`
  // 127.0.0.1 db.localtest.me
  const [protocol, port] =
    host === 'db.localtest.me' ? ['http', 4444] : ['https', 443]
  return `${protocol}://${host}:${port}/sql`
}

/**
 * This sets the postgres grand unified config (GUC) and determines the identity
 * that gets used for every request to db for the purpose of authorization
 * in row-level-security! So be very careful
 */
export function localGucForViewer(viewer: Viewer) {
  switch (viewer.role) {
    case 'anon':
      return {role: 'anon'}
    case 'customer':
      return {
        role: 'customer',
        'request.jwt.claim.customer_id': viewer.customerId,
        'request.jwt.claim.org_id': viewer.orgId,
      }
    case 'user':
      return {
        role: 'authenticated',
        'request.jwt.claim.sub': viewer.userId,
        'request.jwt.claim.org_id': viewer.orgId ?? null,
      }
    case 'org':
      return {role: 'org', 'request.jwt.claim.org_id': viewer.orgId}
    case 'system':
      return {role: null} // Should be the same as reset role and therefore operates without RLS policy
    default:
      throw new Error(`Unknown viewer role: ${(viewer as Viewer).role}`)
  }
  // Should we erase keys incompatible with current viewer role to avoid confusion?
}

export function databaseForViewer(viewer: Viewer) {
  const neonSql = neon(env.DATABASE_URL)
  const db = drizzleProxy(async (query, params, method) => {
    const guc = localGucForViewer(viewer)

    // NOTE: this should work but it doesn't, for now hardcoding converting any updated_at and created_at to iso strings
    // import types from 'pg-types'

    // types.setTypeParser(1184, (value: string) => {
    //   console.log('Timestamp parser called with:', value)
    //   return value ? new Date(value).toISOString() : null
    // })
    const allResponses = await neonSql.transaction(
      [
        ...Object.entries(guc).map(
          ([key, value]) => neonSql`SELECT set_config(${key}, ${value}, true)`,
        ),
        neonSql(query, params),
      ],
      {
        fullResults: true,
        arrayMode: method === 'all',
        // types,
      },
    )
    const res = allResponses.pop()

    if (res?.rows) {
      res.rows = res.rows.map((row) => {
        if (typeof row === 'object' && row !== null) {
          const newRow: Record<string, any> = {...row}
          for (const key in newRow) {
            if (newRow[key] instanceof Date) {
              newRow[key] = newRow[key].toISOString()
            }
          }
          return newRow
        }
        return row
      })
    }

    return {rows: res?.rows ?? []}
  })
  return db
}

export async function ensureSchema(
  thisDb: ReturnType<typeof databaseForViewer>,
  schema: string,
) {
  // Check existence first because we may not have permission to actually create the schema
  const exists = await thisDb
    .execute(
      sql`SELECT true as exists FROM information_schema.schemata WHERE schema_name = ${schema}`,
    )
    .then((r) => r[0]?.['exists'] === true)
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
