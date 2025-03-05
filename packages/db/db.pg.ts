import {drizzle as drizzlePg} from 'drizzle-orm/node-postgres'
import {migrate} from 'drizzle-orm/node-postgres/migrator'
import {drizzle as drizzlePgProxy} from 'drizzle-orm/pg-proxy'
import {migrate as migratePgProxy} from 'drizzle-orm/pg-proxy/migrator'
import {Pool, types} from 'pg'
import type {Viewer} from '@openint/cdk'
import type {DbOptions} from './db'
import {dbFactory, getDrizzleConfig, getMigrationConfig} from './db'
import {rlsStatementsForViewer} from './schema/rls'

function drizzleForViewer(
  pool: Pool,
  viewer: Viewer | null,
  options: DbOptions,
) {
  return drizzlePgProxy(async (query, params, method) => {
    const client = await pool.connect()
    try {
      if (viewer) {
        await client.query(
          ['BEGIN;', ...rlsStatementsForViewer(viewer)].join('\n'),
        )
      }
      const res = await client.query({
        text: query,
        types,
        values: params,
        ...(method === 'all' ? {rowMode: 'array'} : {}),
      })
      if (viewer) {
        await client.query('COMMIT;')
      }
      return {rows: res.rows}
    } catch (err) {
      if (viewer) {
        await client.query('ROLLBACK;')
      }
      throw err
    } finally {
      client.release()
    }
  }, getDrizzleConfig(options))
}

export function initDbPg(url: string, options: DbOptions = {}) {
  types.setTypeParser(types.builtins.DATE, (val) => val)
  types.setTypeParser(types.builtins.TIMESTAMP, (val) => val)
  types.setTypeParser(types.builtins.TIMESTAMPTZ, (val) => val)
  types.setTypeParser(types.builtins.INTERVAL, (val) => val)

  const pool = new Pool({connectionString: url, types})

  const db = drizzleForViewer(pool, null, options)

  return dbFactory('pg', db, {
    $asViewer: (viewer) => drizzleForViewer(pool, viewer, options),
    async $exec(query) {
      const res = await db.execute(query)
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
      return {rows: res as any[]}
    },
    async $migrate() {
      return migratePgProxy(
        db,
        async (queries) => {
          if (queries.length === 0) {
            return
          }
          const client = await pool.connect()
          try {
            for (const query of queries) {
              await client
                .query(query)
                .catch((err) => {
                  console.error('error migrating', query, err)
                  throw err
                })
                .then(() => {
                  console.log('migrated', query)
                })
            }
          } finally {
            client.release()
          }
          console.log('[migration] ran', queries.length, 'queries')
        },
        getMigrationConfig(),
      )
    },
    async $end() {
      return pool.end()
    },
  })
}

export function initDbPgDirect(url: string, options: DbOptions = {}) {
  const pool = new Pool({connectionString: url})
  const db = drizzlePg({...getDrizzleConfig(options), client: pool})
  return dbFactory('pg_direct', db, {
    async $exec(query) {
      const res = await db.execute(query)
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
      return {rows: res.rows as any[]}
    },
    $migrate() {
      return migrate(db, getMigrationConfig())
    },
    $end() {
      return pool.end()
    },
  })
}
