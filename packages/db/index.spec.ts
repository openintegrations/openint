import {generateDrizzleJson, generateMigration} from 'drizzle-kit/api'
import {sql} from 'drizzle-orm'
import {check, customType, pgTable} from 'drizzle-orm/pg-core'
import {drizzle} from 'drizzle-orm/postgres-js'
import {env} from '@openint/env'

describe('test db', () => {
  // console.log('filename', __filename)
  const dbName = 'db_index'

  // TODO: Add me back in once we know CI is working
  beforeAll(async () => {
    const masterDb = drizzle(env.DATABASE_URL, {logger: true})
    await masterDb.execute(`DROP DATABASE IF EXISTS ${dbName}`)
    await masterDb.execute(`CREATE DATABASE ${dbName}`)
    await masterDb.$client.end()
  })

  const dbUrl = new URL(env.DATABASE_URL)
  dbUrl.pathname = `/${dbName}`
  const db = drizzle(dbUrl.toString(), {logger: true})

  test('connect', async () => {
    const res = await db.execute('select 1+1 as sum')
    expect(res[0]).toEqual({sum: 2})
  })

  const customText = customType<{data: unknown}>({dataType: () => 'text'})

  const table = pgTable(
    'account',
    (t) => ({
      id: t.serial().primaryKey(),
      email: t.text(),
      data: t.jsonb(),
      ts: t.timestamp({withTimezone: true}).defaultNow(),
      ts_str: t.timestamp({withTimezone: true, mode: 'string'}).defaultNow(),
      custom: customText(),
    }),
    (table) => [check('email_check', sql`${table.email} LIKE '%@%'`)],
  )

  test('column definition', () => {
    expect(table.data.columnType).toEqual('PgJsonb')
    expect(table.data.dataType).toEqual('json')
  })

  test('migrate', async () => {
    const migrations = await generateMigration(
      generateDrizzleJson({}),
      generateDrizzleJson({table}),
    )
    expect(migrations).toMatchInlineSnapshot(`
      [
        "CREATE TABLE "account" (
      	"id" serial PRIMARY KEY NOT NULL,
      	"email" text,
      	"data" jsonb,
      	"ts" timestamp with time zone DEFAULT now(),
      	"ts_str" timestamp with time zone DEFAULT now(),
      	"custom" text,
      	CONSTRAINT "email_check" CHECK ("account"."email" LIKE '%@%')
      );
      ",
      ]
    `)
    for (const migration of migrations) {
      await db.execute(migration)
    }
  })

  test('date operations', async () => {
    const date = new Date('2021-01-01')
    await db
      .insert(table)
      .values({email: 'hello@world.com', ts: date, data: {hello: 'world'}})
    await expect(db.insert(table).values({email: 'nihao.com'})).rejects.toThrow(
      'violates check constraint',
    )
    await expect(
      db.insert(table).values({ts_str: date as any}),
    ).rejects.toThrow(
      '"string" argument must be of type string or an instance of Buffer or ArrayBuffer. Received an instance of Date',
    )
    // fetch with db.select
    const rows = await db.select().from(table).execute()
    expect(rows).toEqual([
      {
        id: 1,
        email: 'hello@world.com',
        data: {hello: 'world'},
        ts: date,
        ts_str: expect.any(String),
        custom: null,
      },
    ])

    // fetch raw with db.execute
    const rows2 = await db.execute(sql`SELECT * FROM ${table}`)
    expect(rows2).toEqual([
      {
        id: 1,
        email: 'hello@world.com',
        data: {hello: 'world'},
        ts: expect.any(String), // '2021-01-01 01:00:00+01', // returns as string instead of Date
        ts_str: expect.any(String),
        custom: null,
      },
    ])
    const date2 = new Date(rows2[0]?.['ts'] as string)
    expect(date2.getTime()).toEqual(date.getTime())
  })

  test('camelCase support', async () => {
    const db2 = drizzle(dbUrl.toString(), {logger: true, casing: 'snake_case'})
    // works for column names only, not table names
    await db2.execute(sql`
      create table if not exists "myAccount" (
        my_id serial primary key
      );
    `)

    const camelTable = pgTable('myAccount', (t) => ({
      myId: t.serial().primaryKey(),
    }))

    // works for queries involving table
    await db2.insert(camelTable).values({myId: 1})
    const rows = await db2.select().from(camelTable).execute()
    expect(rows).toEqual([{myId: 1}])

    // does not work for raw queries...
    const rows2 = await db2.execute(sql`select * from "myAccount"`)
    expect(rows2).toEqual([{my_id: 1}])
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
        sql`SELECT * FROM account where email = ANY(${sql.param([
          'a',
        ])}::int[])`,
      ),
    ).rejects.toThrow('operator does not exist: text = integer')
  })

  test('jsonb inserts require string input', async () => {
    await expect(() =>
      db.execute(
        sql`INSERT INTO account (email, data) VALUES (${'hi@mail.com'}, ${{
          a: 1,
        }})`,
      ),
    ).rejects.toThrow(
      'The "string" argument must be of type string or an instance of Buffer or ArrayBuffer. Received an instance of Object',
    )
    await expect(() =>
      db.execute(
        sql`INSERT INTO account (email, data) VALUES (${'bool@mail.com'}, ${true})`,
      ),
    ).rejects.toThrow(
      'column "data" is of type jsonb but expression is of type boolean',
    )
    await expect(() =>
      db.execute(
        sql`INSERT INTO account (email, data) VALUES (${'int@mail.com'}, ${123})`,
      ),
    ).rejects.toThrow(
      'The "string" argument must be of type string or an instance of Buffer or ArrayBuffer. Received type number',
    )
    await expect(() =>
      db.execute(
        sql`INSERT INTO account (email, data) VALUES (${'str@mail.com'}, ${'str'})`,
      ),
    ).rejects.toThrow('invalid input syntax for type json')
    await db.execute(
      sql`INSERT INTO account (email, data) VALUES (${'null@mail.com'}, ${'null'})`,
    )
    // no easy way to differentiate between sql null vs. jsonb null
    await db.execute(
      sql`INSERT INTO account (email, data) VALUES (${'sqlNULL@mail.com'}, ${null})`,
    )

    await db.execute(
      sql`INSERT INTO account (email, data) VALUES (${'hi@mail.com'}, ${JSON.stringify(
        {a: 1},
      )})`,
    )
    expect(
      await db
        .execute(
          sql`SELECT * FROM ${table} where ${table.email} = ${'hi@mail.com'}`,
        )
        .then((r) => r[0]),
    ).toMatchObject({
      email: 'hi@mail.com',
      data: {a: 1},
    })
    expect(
      await db
        .execute(
          sql`SELECT * FROM ${table} where ${table.email} = ${'sqlNULL@mail.com'}`,
        )
        .then((r) => r[0]),
    ).toMatchObject({
      email: 'sqlNULL@mail.com',
      data: null,
    })
    expect(
      await db
        .execute(
          sql`SELECT * FROM ${table} where ${table.email} = ${'null@mail.com'}`,
        )
        .then((r) => r[0]),
    ).toMatchObject({
      email: 'null@mail.com',
      data: null,
    })
  })

  test('= ANY query requires sql.param', async () => {
    await expect(
      db.execute(sql`SELECT true WHERE 'a' = ANY(${['a']})`),
    ).rejects.toThrow('malformed array literal: "a"')

    await expect(
      db.execute(sql`SELECT true WHERE 'a' = ANY(${sql.param(['a'])})`),
    ).resolves.toEqual([{'?column?': true}])
  })

  afterAll(() => db.$client.end())
})
