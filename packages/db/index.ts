import {sql} from 'drizzle-orm'
import {type Database} from './db'
import * as schema from './schema/schema'

export * from 'drizzle-orm'
export * from './lib/stripeNullByte'
export * from './lib/upsert'
export {schema}

export async function ensureSchema(thisDb: Database, schema: string) {
  // Check existence first because we may not have permission to actually create the schema
  const exists = await thisDb
    .$exec(
      sql`SELECT true as exists FROM information_schema.schemata WHERE schema_name = ${schema}`,
    )
    .then((r) => r.rows[0]?.['exists'] === true)

  if (exists) {
    return
  }
  await thisDb.$exec(sql`CREATE SCHEMA IF NOT EXISTS ${sql.identifier(schema)};`)
}
