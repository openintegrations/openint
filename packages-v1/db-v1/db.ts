import {PGlite} from '@electric-sql/pglite'
import {drizzle as drizzleLite} from 'drizzle-orm/pglite'
import {drizzle} from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import {env} from '@openint/env'
import schema from './schema'

export function createLiteDatabase() {
  const pg = new PGlite()

  const db = drizzleLite({client: pg, schema, logger: true})
  return db
}

export function createDatabase(opts: {url: string}) {
  const pg = postgres(opts.url)
  const db = drizzle({client: pg, schema, logger: true})
  return db
}

export function createTestDatabase() {
  if (env.PGLITE !== false) {
    return createLiteDatabase()
  } else {
    return createDatabase({url: env.DATABASE_URL})
  }
}

// Should allow either lite or full pg
export async function setupTestDatabase({
  name,
  ...opts
}: {
  url: string
  name: string
}) {
  const db = createDatabase(opts)

  await db.execute(`DROP DATABASE IF EXISTS ${name}`)
  await db.execute(`CREATE DATABASE ${name}`)
  const url = new URL(opts.url)
  url.pathname = `/${name}`
  // console.log('setupTestDb url:', url.toString())
  // console.log(url.toString())
  return createDatabase({...opts, url: url.toString()})
}

export type Database =
  | ReturnType<typeof createLiteDatabase>
  | ReturnType<typeof createDatabase>
