import {PGlite} from '@electric-sql/pglite'
import {drizzle as drizzleLite} from 'drizzle-orm/pglite'
import {getDrizzleConfig, type DbOptions} from './db'

export function initDbPGLite(options: DbOptions = {}) {
  const pg = new PGlite()
  const db = drizzleLite({...getDrizzleConfig(options), client: pg})
  return db
}
