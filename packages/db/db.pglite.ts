import {PGlite} from '@electric-sql/pglite'
// @ts-expect-error need to update module resolution to node_next for typescript to work, but works at runtime
import {uuid_ossp} from '@electric-sql/pglite/contrib/uuid_ossp'
import {drizzle as drizzleLite} from 'drizzle-orm/pglite'
import {migrate} from 'drizzle-orm/pglite/migrator'
import {
  dbFactory,
  getDrizzleConfig,
  getMigrationConfig,
  type DbOptions,
} from './db'

export function initDbPGLite({
  enableExtensions,
  ...options
}: {enableExtensions?: boolean} & DbOptions = {}) {
  const pglite = new PGlite({
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    extensions: enableExtensions ? {uuid_ossp} : undefined,
  })
  const db = drizzleLite({...getDrizzleConfig(options), client: pglite})
  return dbFactory('pglite', db, {
    async $exec(query) {
      const res = await db.execute(query)
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
      return {rows: res.rows as any[]}
    },
    $migrate() {
      return migrate(db, getMigrationConfig())
    },
    $end() {
      return pglite.close()
    },
  })
}
