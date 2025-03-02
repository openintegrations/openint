import {drizzle as drizzlePg} from 'drizzle-orm/node-postgres'
import {Pool} from 'pg'
import type {DbOptions} from './db'
import {getDrizzleConfig} from './db'

export function initDbPg(url: string, options: DbOptions = {}) {
  const pool = new Pool({connectionString: url})
  const db = drizzlePg({...getDrizzleConfig(options), client: pool})
  return db
}
