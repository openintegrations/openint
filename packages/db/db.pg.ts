import {drizzle as drizzlePg} from 'drizzle-orm/node-postgres'
import {migrate} from 'drizzle-orm/node-postgres/migrator'
import {Pool} from 'pg'
import type {DbOptions} from './db'
import {dbFactory, getDrizzleConfig, getMigrationConfig} from './db'

export function initDbPg(url: string, options: DbOptions = {}) {
  const pool = new Pool({connectionString: url})
  const db = drizzlePg({...getDrizzleConfig(options), client: pool})
  return dbFactory('pg', db, {
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
