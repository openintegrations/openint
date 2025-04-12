import type {QueryOptions} from '@electric-sql/pglite'
import type {Viewer} from '@openint/cdk'
import type {DbOptions} from './db'

import {PGlite} from '@electric-sql/pglite'
import {drizzle as drizzlePgProxy} from 'drizzle-orm/pg-proxy'
import {migrate as migratePgProxy} from 'drizzle-orm/pg-proxy/migrator'
import {drizzle as drizzlePGLite} from 'drizzle-orm/pglite'
import {migrate as migratePGLite} from 'drizzle-orm/pglite/migrator'
import {dbFactory, getDrizzleConfig, getMigrationConfig} from './db'
import {parsers} from './lib/type-parsers'
import {rlsStatementsForViewer} from './schema/rls'

function drizzleForViewer(
  pglite: PGlite,
  viewer: Viewer | null,
  options: DbOptions,
) {
  return drizzlePgProxy(async (query, params, method) => {
    const options: QueryOptions = {
      rowMode: method === 'all' ? 'array' : 'object',
      // identity parsers, allow drizzle itself to do the work of mapping based on for example timestamp mode
      parsers,
    }
    if (viewer) {
      const res = await pglite.transaction(async (tx) => {
        await tx.exec(rlsStatementsForViewer(viewer).join('\n'))
        return tx.query(query, params, options)
      })
      return {rows: res.rows}
    } else {
      const res = await pglite.query(query, params, options)
      return {rows: res.rows}
    }
  }, getDrizzleConfig(options))
}

export function initDbPGLite(options: DbOptions = {}) {
  const pglite = new PGlite({parsers})

  const db = drizzleForViewer(pglite, null, options)

  return dbFactory('pglite', db, {
    $asViewer: (viewer) => drizzleForViewer(pglite, viewer, options),
    async $exec(query) {
      const res = await db.execute(query)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return {rows: res as any[]}
    },
    async $migrate() {
      return migratePgProxy(
        db,
        async (queries) => {
          await pglite.exec(queries.join(';\n'))
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

export function initDbPGLiteDirect(options: DbOptions) {
  const pglite = new PGlite({parsers})
  const db = drizzlePGLite({...getDrizzleConfig(options), client: pglite})
  return dbFactory('pglite-direct', db, {
    async $exec(query) {
      const res = await db.execute(query)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
