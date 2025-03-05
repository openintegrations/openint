import path from 'node:path'
import {generateDrizzleJson, generateMigration} from 'drizzle-kit/api'
import {sql} from 'drizzle-orm'
import {env, envRequired} from '@openint/env'
import {snakeCase} from '@openint/util'
import {schema} from '..'
import type {AnyDatabase, Database, DatabaseDriver} from '../db'
import {initDbNeon} from '../db.neon'
import {initDbPg, initDbPgDirect} from '../db.pg'
import {initDbPGLite, initDbPGLiteDirect} from '../db.pglite'

interface TestDbInitOptions {
  url: string
  logger?: boolean
}

export const testDbs = {
  // neon driver does not work well for migration at the moment and
  // and should therefore not be used for running migrations
  neon: ({url, logger}) => initDbNeon(url, {logger}),
  pg: ({url, logger}) => initDbPg(url, {logger}),
  'pg-direct': ({url, logger}) => initDbPgDirect(url, {logger}),
  pglite: ({logger}) => initDbPGLite({logger}),
  'pglite-direct': ({logger}) => initDbPGLiteDirect({logger}),
} satisfies {[k in DatabaseDriver]: (opts: TestDbInitOptions) => Database<k>}

export const ALL_DRIVERS = Object.keys(testDbs) as DatabaseDriver[]
export const RLS_DRIVERS = ['pg', 'pglite', 'neon'] satisfies DatabaseDriver[]

export type DescribeEachDatabaseOptions<
  T extends DatabaseDriver = DatabaseDriver,
> = {
  /** Create a random database using the current filename */
  __filename?: string
  /** Defaults to `pglite` */
  drivers?: T[] | 'all' | 'rls'
  migrate?: boolean
  truncateBeforeAll?: boolean
} & Omit<TestDbInitOptions, 'url'>

export function describeEachDatabase<T extends DatabaseDriver>(
  options: DescribeEachDatabaseOptions<T>,
  testBlock: (db: Database<T>) => void,
) {
  const {
    __filename: prefix,
    drivers: _drivers = ['pglite'],
    migrate = false,
    truncateBeforeAll = false,
    ...testDbOpts
  } = options

  const drivers: DatabaseDriver[] =
    _drivers === 'all'
      ? ALL_DRIVERS
      : _drivers === 'rls'
        ? RLS_DRIVERS
        : _drivers

  const dbEntriesFiltered = Object.entries(testDbs).filter(([d]) =>
    drivers.includes(d as DatabaseDriver),
  ) as Array<[T, (opts: TestDbInitOptions) => AnyDatabase]>

  describe.each(dbEntriesFiltered)('db: %s', (driver, makeDb) => {
    const baseUrl = new URL(
      // TODO: Make test database url separate env var from prod database url to be safer
      env.DATABASE_URL_UNPOOLED ?? envRequired.DATABASE_URL,
    )
    let baseDb: AnyDatabase | undefined

    const name = prefix
      ? [
          snakeCase(path.basename(prefix, path.extname(prefix))),
          new Date()
            .toISOString()
            .replaceAll(/[:Z\-\.]/g, '')
            .replace(/T/, '_'),
          driver.replace(/-/g, '_'),
        ].join('_')
      : undefined
    const url = new URL(baseUrl)
    if (name && url.pathname !== `/${name}`) {
      url.pathname = `/${name}`
    }
    const db = makeDb({url: url.toString(), ...testDbOpts})

    beforeAll(async () => {
      if (driver !== 'pglite' && url.toString() !== baseUrl.toString()) {
        baseDb = makeDb({url: baseUrl.toString(), ...testDbOpts})
        await baseDb.execute(`DROP DATABASE IF EXISTS ${name}`)
        await baseDb.execute(`CREATE DATABASE ${name}`)
      }
      if (migrate) {
        await db.$migrate()
      }
      if (truncateBeforeAll) {
        await db.$truncateAll()
      }
    })

    testBlock(db as Database<T>)

    afterAll(async () => {
      await db.$end?.()
      // Cleaning is not often possible because connection poolers will attempt
      // to hold on to references of database preventing drops
      // await baseDb?.execute(`DROP DATABASE IF EXISTS ${name}`)
      await baseDb?.$end?.()
    }, 1000)
  })
}

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
  await thisDb.$exec(
    sql`CREATE SCHEMA IF NOT EXISTS ${sql.identifier(schema)};`,
  )
}

// Importing `drizzle-kit/api` in this file causes next.js to crash... So we are separating it instead
// ./node_modules/.pnpm/@esbuild+darwin-arm64@0.19.12/node_modules/@esbuild/darwin-arm64/bin/esbuild
// Reading source code for parsing failed
// An unexpected error happened while trying to read the source code to parse: failed to convert rope into string

// Caused by:
// - invalid utf-8 sequence of 1 bytes from index 0
/** For the full schema, pretty much only used for testing */
export async function getMigrationStatements(
  imports: Record<string, unknown> = schema,
) {
  return generateMigration(
    generateDrizzleJson({}),
    generateDrizzleJson(imports),
  )
}
