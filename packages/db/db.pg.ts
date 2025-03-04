import {drizzle as drizzlePg} from 'drizzle-orm/node-postgres'
import {migrate} from 'drizzle-orm/node-postgres/migrator'
import {drizzle as drizzlePgProxy} from 'drizzle-orm/pg-proxy'
import {migrate as migratePgProxy} from 'drizzle-orm/pg-proxy/migrator'
import {Pool, types} from 'pg'
import type {DbOptions} from './db'
import {dbFactory, getDrizzleConfig, getMigrationConfig} from './db'

export function initDbPg(url: string, options: DbOptions = {}) {
  types.setTypeParser(types.builtins.DATE, (val) => val)
  types.setTypeParser(types.builtins.TIMESTAMP, (val) => val)
  types.setTypeParser(types.builtins.TIMESTAMPTZ, (val) => val)
  types.setTypeParser(types.builtins.INTERVAL, (val) => val)

  const pool = new Pool({connectionString: url, types})

  const db = drizzlePgProxy(async (query, params, method) => {
    const client = await pool.connect()
    try {
      const res = await client.query({
        text: query,
        types,
        values: params,
        ...(method === 'all' ? {rowMode: 'array'} : {}),
      })
      return {rows: res.rows}
    } finally {
      client.release()
    }
  }, getDrizzleConfig(options))

  return dbFactory('pg', db, {
    async $exec(query) {
      const res = await db.execute(query)
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
      return {rows: res as any[]}
    },
    async $migrate() {
      return migratePgProxy(
        db,
        async (queries) => {
          const client = await pool.connect()
          try {
            await client.query('BEGIN')

            for (const query of queries) {
              await client.query(query)
            }
            await client.query('COMMIT')
          } catch (err) {
            await client.query('ROLLBACK')
            throw err
          } finally {
            client.release()
          }
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
