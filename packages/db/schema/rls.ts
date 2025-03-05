import {sql} from 'drizzle-orm'
import type {Viewer} from '@openint/cdk'
import type {Database, DatabaseDriver} from '../db'

/**
 * This sets the postgres grand unified config (GUC) and determines the identity
 * that gets used for every request to db for the purpose of authorization
 * in row-level-security! So be very careful
 */
export function rlsGucForViewer(viewer: Viewer) {
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

export function rlsStatementsForViewer(
  viewer: Viewer,
  /** If true, config will only apply to the current transaction */
  local = true,
) {
  return Object.entries(rlsGucForViewer(viewer)).map(
    ([k, v]) => `SELECT set_config('${k}', '${v}', ${local});`,
  )
}

/**
 * Reference from here https://orm.drizzle.team/docs/rls#using-with-supabase
 * However making database a callback makes context initialization more diffcult
 * and standardizing on pg-proxy is probably a good thing for dev & prod parity
 */
export function withDatabaseForViewer<T extends DatabaseDriver>(
  db: Database<T>,
  viewer: Viewer,
  fn: (db: DatabaseTransaction<T>) => Promise<void>,
) {
  db.transaction(async (tx) => {
    await Promise.all(
      Object.entries(rlsGucForViewer(viewer)).map(([key, value]) =>
        tx.execute(sql`SELECT set_config(${key}, ${value}, true)`),
      ),
    )
    await fn(tx)
  })
}

export type DatabaseTransaction<
  TDriver extends DatabaseDriver = DatabaseDriver,
> = Parameters<Parameters<Database<TDriver>['transaction']>[0]>[0]
