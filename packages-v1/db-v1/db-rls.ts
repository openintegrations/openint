import {neon, neonConfig} from '@neondatabase/serverless'
import {drizzle as drizzleProxy} from 'drizzle-orm/pg-proxy'
import type {Viewer} from '@openint/cdk'

/** it's a bit weird that config like this is global rather than constructor specific... oh well */
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

export function databaseForViewer(url: string, viewer: Viewer) {
  const neonSql = neon(url)
  const db = drizzleProxy(async (query, params, method) => {
    const guc = localGucForViewer(viewer)
    const allResponses = await neonSql.transaction(
      [
        ...Object.entries(guc).map(
          ([key, value]) => neonSql`SELECT set_config(${key}, ${value}, true)`,
        ),
        neonSql(query, params),
      ],
      {fullResults: true, arrayMode: method === 'all'},
    )
    const res = allResponses.pop()
    return {rows: res?.rows ?? []}
  })
  return db
}
