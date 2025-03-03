import {env, envRequired} from '@openint/env'
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
