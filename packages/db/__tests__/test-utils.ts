import path from 'node:path'
import {generateDrizzleJson, generateMigration} from 'drizzle-kit/api'
import {env, envRequired} from '@openint/env'
import {snakeCase} from '@openint/util'
import {schema} from '..'
import type {Database, DatabaseDriver} from '../db'
import {initDbNeon} from '../db.neon'
import {initDbPg} from '../db.pg'
import {initDbPGLite} from '../db.pglite'

export const testDbs = {
  // neon driver does not work well for migration at the moment and
  // and should therefore not be used for running migrations
  neon: (url: string) => initDbNeon(url, {role: 'system'}, {logger: false}),
  pglite: () => initDbPGLite({logger: false, enableExtensions: true}),
  pg: (url: string) => initDbPg(url, {logger: false}),
}

export interface DescribeEachDatabaseOptions {
  randomDatabaseFromFilename?: string
  drivers?: DatabaseDriver[]
  migrate?: boolean
  truncateBeforeAll?: boolean
}

export function describeEachDatabase(
  options: DescribeEachDatabaseOptions,
  testBlock: (db: Database) => void,
) {
  const {
    randomDatabaseFromFilename: prefix,
    drivers = ['pg', 'pglite'],
    migrate = true,
    truncateBeforeAll = true,
  } = options

  const dbEntriesFiltered = Object.entries(testDbs).filter(([d]) =>
    drivers.includes(d as DatabaseDriver),
  ) as Array<[DatabaseDriver, (url: string) => Database]>

  describe.each(dbEntriesFiltered)('db: %s', (driver, makeDb) => {
    const baseUrl = new URL(
      // TODO: Make test database url separate env var from prod database url to be safer
      env.DATABASE_URL_UNPOOLED ?? envRequired.DATABASE_URL,
    )
    let baseDb: Database | undefined

    const name = prefix
      ? `${snakeCase(path.basename(prefix, path.extname(prefix)))}_${new Date()
          .toISOString()
          .replaceAll(/[:Z\-\.]/g, '')
          .replace(/T/, '_')}_${driver}`
      : undefined
    const url = new URL(baseUrl)
    if (name && url.pathname !== `/${name}`) {
      url.pathname = `/${name}`
    }
    const db = makeDb(url.toString())

    beforeAll(async () => {
      if (driver !== 'pglite' && url.toString() !== baseUrl.toString()) {
        baseDb = makeDb(baseUrl.toString())
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

    testBlock(db)

    afterAll(async () => {
      await db.$end?.()
      // Cleaning is not often possible because connection poolers will attempt
      // to hold on to references of database preventing drops
      // await baseDb?.execute(`DROP DATABASE IF EXISTS ${name}`)
      await baseDb?.$end?.()
    }, 1000)
  })
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
