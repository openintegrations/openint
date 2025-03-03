import {PGlite} from '@electric-sql/pglite'
import {drizzle as drizzleLite} from 'drizzle-orm/pglite'
import {migrate} from 'drizzle-orm/pglite/migrator'
import type {DrizzleExtension} from './db'
import {getDrizzleConfig, getMigrationConfig, type DbOptions} from './db'
// @ts-expect-error need to update module resolution to node_next for typescript to work, but works at runtime
import {uuid_ossp} from '@electric-sql/pglite/contrib/uuid_ossp'

export function initDbPGLite(options: DbOptions = {}) {
  const pglite = new PGlite({
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    extensions: {uuid_ossp},
  })
  const db = drizzleLite({...getDrizzleConfig(options), client: pglite})
  Object.assign(db, {
    driverType: 'pglite',
    async exec(query) {
      const res = await db.execute(query)
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
      return {rows: res.rows as any[]}
    },
    migrate() {
      return migrate(db, getMigrationConfig())
    },
  } satisfies DrizzleExtension<'pglite'>)
  return db as typeof db & DrizzleExtension<'pglite'>
}
