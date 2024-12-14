import {generateDrizzleJson, generateMigration} from 'drizzle-kit/api'
import {sql} from 'drizzle-orm'
import {check, PgDialect, pgTable} from 'drizzle-orm/pg-core'
import {drizzle} from 'drizzle-orm/postgres-js'
import {env} from '@openint/env'
import {applyLimitOffset} from '.'

// console.log('filename', __filename)
const dbName = 'tbd_db'

// TODO: Add me back in once we know CI is working
beforeAll(async () => {
  const masterDb = drizzle(env.POSTGRES_URL, {logger: true})
  await masterDb.execute(`DROP DATABASE IF EXISTS ${dbName}`)
  await masterDb.execute(`CREATE DATABASE ${dbName}`)
  await masterDb.$client.end()
})

describe('sql generation', () => {
  const pgDialect = new PgDialect()

  test('identifier', () => {
    expect(
      pgDialect.sqlToQuery(
        sql`SELECT true FROM ${sql.identifier('connection')}`,
      ),
    ).toMatchObject({sql: 'SELECT true FROM "connection"', params: []})
  })

  test('concatenate queries', () => {
    const fragment = sql`1 = 1`
    expect(
      pgDialect.sqlToQuery(sql`SELECT true WHERE ${fragment} AND 2 != 1`),
    ).toMatchObject({sql: 'SELECT true WHERE 1 = 1 AND 2 != 1', params: []})
  })

  test('apply limit offset', () => {
    expect(
      pgDialect.sqlToQuery(
        applyLimitOffset(sql`SELECT * FROM connection`, {limit: 10, offset: 5}),
      ),
    ).toMatchObject({
      sql: 'SELECT * FROM connection LIMIT $1 OFFSET $2',
      params: [10, 5],
    })
    expect(
      pgDialect.sqlToQuery(
        applyLimitOffset(sql`SELECT * FROM connection`, {limit: 10}),
      ),
    ).toMatchObject({
      sql: 'SELECT * FROM connection LIMIT $1',
      params: [10],
    })
    expect(
      pgDialect.sqlToQuery(applyLimitOffset(sql`SELECT * FROM connection`, {})),
    ).toMatchObject({
      sql: 'SELECT * FROM connection',
      params: [],
    })
  })

  test('array', () => {
    expect(pgDialect.sqlToQuery(sql`SELECT ${1} + ${2}`)).toMatchObject({
      sql: 'SELECT $1 + $2',
      params: [1, 2],
    })

    const ids = ['i1', 'i2']

    // array input is flattened by default
    expect(
      pgDialect.sqlToQuery(
        sql`SELECT * from connection where id = ANY(${ids}) and status = ${'active'}`,
      ),
    ).toMatchObject({
      sql: 'SELECT * from connection where id = ANY(($1, $2)) and status = $3',
      params: ['i1', 'i2', 'active'],
    })

    // with param array is passed as a single value
    expect(
      pgDialect.sqlToQuery(
        sql`SELECT * from connection where id = ANY(${sql.param(
          ids,
        )}) and status = ${'active'}`,
      ),
    ).toMatchObject({
      sql: 'SELECT * from connection where id = ANY($1) and status = $2',
      params: [['i1', 'i2'], 'active'],
    })
  })
})

const dbUrl = new URL(env.POSTGRES_URL)
dbUrl.pathname = `/${dbName}`
const db = drizzle(dbUrl.toString(), {logger: true})

test('connect', async () => {
  const res = await db.execute('select 1+1 as sum')
  expect(res[0]).toEqual({sum: 2})
})

test('migrate', async () => {
  const table = pgTable(
    'account',
    (t) => ({id: t.serial().primaryKey(), email: t.text()}),
    (table) => [check('email_check', sql`${table.email} LIKE '%@%'`)],
  )
  const migrations = await generateMigration(
    generateDrizzleJson({}),
    generateDrizzleJson({table}),
  )
  expect(migrations).toEqual([
    `CREATE TABLE IF NOT EXISTS "account" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text,
	CONSTRAINT "email_check" CHECK ("account"."email" LIKE '%@%')
);
`,
  ])
  for (const migration of migrations) {
    await db.execute(migration)
  }
  await db.insert(table).values({email: 'hello@world.com'})
  const rows = await db.select().from(table).execute()
  expect(rows).toEqual([{id: 1, email: 'hello@world.com'}])
  await expect(db.insert(table).values({email: 'nihao.com'})).rejects.toThrow(
    'violates check constraint',
  )
})

// Depends on the previous test, cannot be parallel executed
test('array query', async () => {
  // test array query
  const res = await db.execute(
    sql`SELECT * FROM account where email = ANY(${sql.param([
      'hello@world.com',
      'sup@sup.com',
    ])})`,
  )
  expect(res).toMatchObject([{id: 1, email: 'hello@world.com'}])
  const res2 = await db.execute(
    sql`SELECT * FROM account where email = ANY(${sql.param([])})`,
  )
  expect(res2).toMatchObject([])

  await expect(() =>
    db.execute(
      sql`SELECT * FROM account where email = ANY(${sql.param(['a'])}::int[])`,
    ),
  ).rejects.toThrow('operator does not exist: text = integer')
})

afterAll(() => db.$client.end())
