// test/index.test.ts
import {PGlite} from '@electric-sql/pglite'
import {sql} from 'drizzle-orm'
import postgres from 'postgres'
import {env} from '@openint/env'
import type {createDatabase} from './db'
import {createLiteDatabase, setupTestDatabase} from './db'
import {bootstrap} from './migration'
import {getMigrationStatements} from './migration.workaround'
import schema from './schema'

describe('pglite', () => {
  test('init', async () => {
    const pg = new PGlite()
    const res = await pg.query('SELECT 1 + 1 AS result')
    expect(res.rows[0]).toEqual({result: 2})
    await pg.close()
    expect(pg.closed).toBe(true)
  })
})

describe('postgres', () => {
  test('init', async () => {
    const sql = postgres(env.DATABASE_URL)
    const res = await sql`SELECT 1 + 1 AS result`
    expect(res[0]).toEqual({result: 2})
    await sql.end()
  })
})

test('generate migration statements', async () => {
  const statements = await getMigrationStatements()
  expect(statements.length).toBeGreaterThan(0)
})

const dbs = {
  pglite: createLiteDatabase(),
  postgres: undefined as unknown as ReturnType<typeof createDatabase>,
}

beforeAll(async () => {
  dbs.postgres = await setupTestDatabase({
    url: env.DATABASE_URL,
    name: 'db_test',
  })
})

describe.each(Object.keys(dbs))('drizzle: %s', (key) => {
  test('select', async () => {
    const db = dbs[key as keyof typeof dbs]
    const res = await db.execute(sql`SELECT 1 + 1 AS result`)
    const rows = 'rows' in res ? res.rows : res
    expect(rows[0]).toEqual({result: 2})
  })

  test('migration then use migrated tables', async () => {
    const db = dbs[key as keyof typeof dbs]
    await bootstrap(db)
    const returning = await db
      .insert(schema.organization)
      .values({
        id: 'org_123',
        name: 'Cash',
        api_key: '123',
      })
      .returning()
    expect(returning[0]).toMatchObject({
      id: 'org_123',
      name: 'Cash',
    })
  })
})

afterAll(async () => {
  // await dbs.pglite.$client.close()
  await dbs.postgres.$client.end()
})
