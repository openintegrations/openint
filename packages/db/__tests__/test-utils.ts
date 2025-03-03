import {generateDrizzleJson, generateMigration} from 'drizzle-kit/api'
import {env, envRequired} from '@openint/env'
import {schema} from '..'
import type {Database, DatabaseDriver} from '../db'
import {initDbNeon} from '../db.neon'
import {initDbPg} from '../db.pg'
import {initDbPGLite} from '../db.pglite'

export const testDbs = {
  // neon driver does not work well for migration at the moment and
  // and should therefore not be used for running migrations
  neon: () =>
    initDbNeon(
      env.DATABASE_URL_UNPOOLED ?? envRequired.DATABASE_URL,
      {role: 'system'},
      {logger: false},
    ),
  pglite: () => initDbPGLite({logger: false}),
  pg: () =>
    // TODO: Make test database url separate env var from prod database url to be safer
    initDbPg(env.DATABASE_URL_UNPOOLED ?? envRequired.DATABASE_URL, {
      logger: false,
    }),
}

export interface DescribeEachDatabaseOptions {
  drivers?: DatabaseDriver[]
  migrate?: boolean
  truncateBeforeAll?: boolean
}

export function describeEachDatabase(
  options: DescribeEachDatabaseOptions,
  testBlock: (db: Database) => void,
) {
  const {
    drivers = ['pg', 'pglite'],
    migrate = true,
    truncateBeforeAll = true,
  } = options

  const dbEntriesFiltered = Object.entries(testDbs).filter(([d]) =>
    drivers.includes(d as DatabaseDriver),
  )

  describe.each(dbEntriesFiltered)('db: %s', (_driver, makeDb) => {
    const db = makeDb()

    if (migrate) {
      beforeAll(async () => {
        await db.$migrate()
      })
    }
    if (truncateBeforeAll) {
      beforeAll(async () => {
        await db.$truncateAll()
      })
    }

    testBlock(db)
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
