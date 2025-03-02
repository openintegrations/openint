import {drizzle as drizzlePg} from 'drizzle-orm/node-postgres'
import {Pool} from 'pg'
import type {DrizzleExtension, DbOptions} from './db'
import {getDrizzleConfig} from './db'

export function initDbPg(url: string, options: DbOptions = {}) {
  const pool = new Pool({connectionString: url})
  const db = drizzlePg({...getDrizzleConfig(options), client: pool})
  Object.assign(db, {
    driverType: 'pg',
    async exec(query) {
      const res = await db.execute(query)
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
      return {rows: res.rows as any[]}
    },
  } satisfies DrizzleExtension<'pg'>)
  return db as typeof db & DrizzleExtension<'pg'>
}
