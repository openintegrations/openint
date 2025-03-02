import {neon, neonConfig} from '@neondatabase/serverless'
import {drizzle as drizzleProxy} from 'drizzle-orm/pg-proxy'
import type {Viewer} from '@openint/cdk'
import {env} from '@openint/env'

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

export type Database = ReturnType<typeof databaseForViewer>

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
      {fullResults: true, arrayMode: method === 'all' /* types, */},
    )
    const res = allResponses.pop()

    // TODO: Make me work for arrayMode: true
    if (res?.rows) {
      res.rows = res.rows.map((row) => {
        if (typeof row === 'object' && row !== null) {
          const newRow: Record<string, unknown> = {...row}
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
