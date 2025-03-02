import path from 'node:path'
import {drizzle} from 'drizzle-orm/postgres-js'
import {migrate} from 'drizzle-orm/postgres-js/migrator'

/** TODO: Move this somewhere else and have a consolidated definition */
export type Database = ReturnType<typeof drizzle>

/** Generate a database URL for a given database name */
export function urlForDatabase(masterDbUrl: string, name: string) {
  const dbUrl = new URL(masterDbUrl)
  dbUrl.pathname = `/${name}`
  return dbUrl.toString()
}

export async function createTestDatabase(masterDbUrl: string, name: string) {
  const masterDb = drizzle(masterDbUrl, {logger: true})
  await masterDb.execute(`DROP DATABASE IF EXISTS ${name}`)
  await masterDb.execute(`CREATE DATABASE ${name}`)
  await masterDb.$client.end()

  return drizzle(urlForDatabase(masterDbUrl, name), {logger: true})
}

/**
 * Needs to be manually kept in sync with ../drizzle.config.ts
 * Also can only be run once per database cluster due to the fact that we create
 * additional postgres roles which are shared across all databases in the cluster.
 */
export async function runMigration(db: Database) {
  await migrate(db, {
    migrationsFolder: path.join(__dirname, '../migrations'),
    migrationsSchema: 'public',
  })
}

/** Create a test database and run migrations on it */
export async function setupTestDatabase(masterDbUrl: string, name: string) {
  const db = await createTestDatabase(masterDbUrl, name)
  await runMigration(db)
  return db
}
