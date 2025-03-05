import {PGlite, QueryOptions, types} from '@electric-sql/pglite'
import {drizzle as drizzlePgProxy} from 'drizzle-orm/pg-proxy'
import {migrate as migratePgProxy} from 'drizzle-orm/pg-proxy/migrator'
import {drizzle as drizzlePGLite} from 'drizzle-orm/pglite'
import {migrate as migratePGLite} from 'drizzle-orm/pglite/migrator'
import {Viewer} from '@openint/cdk'
import {
  dbFactory,
  getDrizzleConfig,
  getMigrationConfig,
  type DbOptions,
} from './db'
import {localGucForViewer} from './schema/rls'

interface InitPgLiteOptions extends DbOptions {
  viewer?: Viewer
}
export function initDbPGLite({viewer, ...options}: InitPgLiteOptions) {
  const pglite = new PGlite()

  const db = drizzlePgProxy(async (query, params, method) => {
    const options: QueryOptions = {
      rowMode: method === 'all' ? 'array' : 'object',
      // identity parsers, allow drizzle itself to do the work of mapping based on for example timestamp mode
      parsers: {
        [types.TIMESTAMP]: (value) => value,
        [types.TIMESTAMPTZ]: (value) => value,
        [types.INTERVAL]: (value) => value,
        [types.DATE]: (value) => value,
      },
    }
    if (viewer) {
      const gucForRls = localGucForViewer(viewer)
      const res = await pglite.transaction(async (tx) => {
        await tx.exec(
          Object.entries(gucForRls)
            .map(([k, v]) => `SELECT set_config('${k}', '${v}', true);`)
            .join('\n'),
        )
        return tx.query(query, params, options)
      })
      return {rows: res.rows}
    } else {
      const res = await pglite.query(query, params, options)
      return {rows: res.rows}
    }
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
    // TODO: Implement asViewer so we can actually test it out...
    async $end() {
      return pglite.close()
    },
  })
}

// For comparision, not used in prod as not easily used with viewer due to drizzle abstraction

export function initDbPGLiteDirect({...options}: InitPgLiteOptions = {}) {
  const pglite = new PGlite({})
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
