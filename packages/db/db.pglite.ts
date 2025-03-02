import {PGlite} from '@electric-sql/pglite'
import {drizzle as drizzleLite} from 'drizzle-orm/pglite'
import type {DrizzleExtension} from './db'
import {getDrizzleConfig, type DbOptions} from './db'

export function initDbPGLite(options: DbOptions = {}) {
  const pglite = new PGlite()
  const db = drizzleLite({...getDrizzleConfig(options), client: pglite})
  Object.assign(db, {
    driverType: 'pglite',
    async exec(query) {
      const res = await db.execute(query)
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
      return {rows: res.rows as any[]}
    },
  } satisfies DrizzleExtension<'pglite'>)
  return db as typeof db & DrizzleExtension<'pglite'>
}
