import {PGlite, types} from '@electric-sql/pglite'
// @ts-expect-error need to update module resolution to node_next for typescript to work, but works at runtime
import {uuid_ossp} from '@electric-sql/pglite/contrib/uuid_ossp'
import {drizzle as drizzlePgProxy} from 'drizzle-orm/pg-proxy'
import {migrate as migratePgProxy} from 'drizzle-orm/pg-proxy/migrator'
import {drizzle as drizzlePGLite} from 'drizzle-orm/pglite'
import {migrate as migratePGLite} from 'drizzle-orm/pglite/migrator'
import {
  dbFactory,
  getDrizzleConfig,
  getMigrationConfig,
  type DbOptions,
} from './db'

interface InitPgLiteOptions extends DbOptions {
  enableExtensions?: boolean
}
export function initDbPGLite({
  enableExtensions,
  ...options
}: InitPgLiteOptions) {
  const pglite = new PGlite({
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    extensions: enableExtensions ? {uuid_ossp} : undefined,
  })
  const db = drizzlePgProxy(async (query, params, method) => {
    const res = await pglite.query(query, params, {
      rowMode: method === 'all' ? 'array' : 'object',
      // identity parsers, allow drizzle itself to do the work of mapping based on for example
      // timestamp mode
      parsers: {
        [types.TIMESTAMP]: (value) => value,
        [types.TIMESTAMPTZ]: (value) => value,
        [types.INTERVAL]: (value) => value,
        [types.DATE]: (value) => value,
      },
    })
    return {rows: res.rows}
  }, getDrizzleConfig(options))

  return dbFactory('pglite', db, {
    async $exec(query) {
      const res = await db.execute(query)
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
      return {rows: res as any[]}
    },
    async $migrate() {
      return migratePgProxy(
        db,
        async (queries) => {
          await pglite.transaction(async (tx) => {
            for (const query of queries) {
              await tx.exec(query)
            }
          })
        },
        getMigrationConfig(),
      )
    },
    async $end() {
      return pglite.close()
    },
  })
}

// For comparision, not used in prod as not easily used with viewer due to drizzle abstraction

export function initDbPGLiteDirect({
  enableExtensions,
  ...options
}: InitPgLiteOptions = {}) {
  const pglite = new PGlite({
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    extensions: enableExtensions ? {uuid_ossp} : undefined,
  })
  const db = drizzlePGLite({...getDrizzleConfig(options), client: pglite})
  return dbFactory('pglite_direct', db, {
    async $exec(query) {
      const res = await db.execute(query)
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
      return {rows: res.rows as any[]}
    },
    $migrate() {
      return migratePGLite(db, getMigrationConfig())
    },
    $end() {
      return pglite.close()
    },
  })
}
