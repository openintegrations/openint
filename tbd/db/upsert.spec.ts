import {sql} from 'drizzle-orm'
import {
  boolean,
  integer,
  jsonb,
  pgTable,
  serial,
  varchar,
} from 'drizzle-orm/pg-core'
import {env} from '@openint/env'
import {configDb, drizzle} from './'
import {engagement_sequence} from './schema-dynamic'
import {dbUpsert, dbUpsertOne, inferTableForUpsert} from './upsert'

async function formatSql(sqlString: string) {
  const prettier = await import('prettier')
  const prettierSql = await import('prettier-plugin-sql')
  return prettier.format(sqlString, {
    parser: 'sql',
    plugins: [prettierSql.default],
    // https://github.com/un-ts/prettier/tree/master/packages/sql#sql-in-js-with-prettier-plugin-embed
    ['language' as 'filepath' /* workaround type error */]: 'postgresql',
  })
}

test('upsert query', async () => {
  const query = dbUpsert(
    configDb,
    engagement_sequence,
    [
      {
        source_id: 'source_id',
        id: '123',
        is_deleted: false,
        // Workaround jsonb support issue... https://github.com/drizzle-team/drizzle-orm/issues/724
        raw: sql`${{hello: 1}}::jsonb`,
        unified: sql`${{world: 2}}::jsonb`,
      },
    ],
    {
      shallowMergeJsonbColumns: ['raw', 'unified'],
      noDiffColumns: ['updated_at'],
    },
  )
  expect(await formatSql(query?.toSQL().sql ?? '')).toMatchInlineSnapshot(`
    "insert into
      "engagement_sequence" (
        "source_id",
        "id",
        "created_at",
        "updated_at",
        "is_deleted",
        "raw",
        "unified"
      )
    values
      (
        $1,
        $2,
        default,
        default,
        $3,
        $4::jsonb,
        $5::jsonb
      )
    on conflict ("source_id", "id") do
    update
    set
      "is_deleted" = excluded."is_deleted",
      "raw" = COALESCE("engagement_sequence"."raw", '{}'::jsonb) || excluded."raw",
      "unified" = COALESCE("engagement_sequence"."unified", '{}'::jsonb) || excluded."unified"
    where
      (
        "engagement_sequence"."is_deleted" IS DISTINCT FROM excluded."is_deleted"
        or "engagement_sequence"."raw" IS DISTINCT FROM excluded."raw"
        or "engagement_sequence"."unified" IS DISTINCT FROM excluded."unified"
      )
    "
  `)
})

test('upsert param handling inc. jsonb', async () => {
  const query = dbUpsertOne(
    configDb,
    pgTable('test', {
      id: serial().primaryKey(),
      is_deleted: boolean(),
      data: jsonb(),
      data2: jsonb(),
      data3: jsonb(),
      name: varchar(),
      name2: varchar(),
      name3: varchar(),
      count: integer(),
      count2: integer(),
      count3: integer(),
    }),
    {
      id: '123' as never,
      is_deleted: {} as never,
      data: 'abc',
      data2: true,
      data3: ['123'],
      name: 'abc',
      name2: true as never,
      name3: ['123'] as never,
      count: 'abc' as never,
      count2: true as never,
      count3: ['123'] as never,
    },
    {
      keyColumns: ['id' as never],
    },
  )
  expect(query.toSQL().params).toEqual([
    '123',
    {},
    '"abc"', // jsonb
    'true', // jsonb
    '["123"]', // jsonb
    'abc', // scalar (varchar)
    true, // scalar (varchar)
    ['123'], // scalar (varchar)
    'abc', // scalar (integer)
    true, // scalar (integer)
    ['123'], // scalar (integer)
  ])
  expect(await formatSql(query?.toSQL().sql)).toMatchInlineSnapshot(`
    "insert into
      "test" (
        "id",
        "is_deleted",
        "data",
        "data2",
        "data3",
        "name",
        "name2",
        "name3",
        "count",
        "count2",
        "count3"
      )
    values
      ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    on conflict ("id") do
    update
    set
      "is_deleted" = excluded."is_deleted",
      "data" = excluded."data",
      "data2" = excluded."data2",
      "data3" = excluded."data3",
      "name" = excluded."name",
      "name2" = excluded."name2",
      "name3" = excluded."name3",
      "count" = excluded."count",
      "count2" = excluded."count2",
      "count3" = excluded."count3"
    where
      (
        "test"."is_deleted" IS DISTINCT FROM excluded."is_deleted"
        or "test"."data" IS DISTINCT FROM excluded."data"
        or "test"."data2" IS DISTINCT FROM excluded."data2"
        or "test"."data3" IS DISTINCT FROM excluded."data3"
        or "test"."name" IS DISTINCT FROM excluded."name"
        or "test"."name2" IS DISTINCT FROM excluded."name2"
        or "test"."name3" IS DISTINCT FROM excluded."name3"
        or "test"."count" IS DISTINCT FROM excluded."count"
        or "test"."count2" IS DISTINCT FROM excluded."count2"
        or "test"."count3" IS DISTINCT FROM excluded."count3"
      )
    "
  `)
})

test('upsert query with inferred table', async () => {
  const row = {
    id: '123',
    name: 'abc',
    count: 1,
    data: {hello: 'world'},
  }
  const table = inferTableForUpsert('test_user', row)
  const query = dbUpsertOne(drizzle(''), table, row, {keyColumns: ['id']})
  expect(query.toSQL().params).toEqual(['123', 'abc', 1, '{"hello":"world"}'])
  expect(await formatSql(query.toSQL().sql)).toMatchInlineSnapshot(`
    "insert into
      "test_user" ("id", "name", "count", "data")
    values
      ($1, $2, $3, $4)
    on conflict ("id") do
    update
    set
      "name" = excluded."name",
      "count" = excluded."count",
      "data" = excluded."data"
    where
      (
        "test_user"."name" IS DISTINCT FROM excluded."name"
        or "test_user"."count" IS DISTINCT FROM excluded."count"
        or "test_user"."data" IS DISTINCT FROM excluded."data"
      )
    "
  `)
})

describe('with db', () => {
  // console.log('filename', __filename)
  const dbName = 'upsert_db'

  beforeAll(async () => {
    const masterDb = drizzle(env.DATABASE_URL, {logger: true})
    await masterDb.execute(`DROP DATABASE IF EXISTS ${dbName}`)
    await masterDb.execute(`CREATE DATABASE ${dbName}`)
    // EDGE
    // await masterDb.$client.end()
  })

  const dbUrl = new URL(env.DATABASE_URL)
  dbUrl.pathname = `/${dbName}`
  const db = drizzle(dbUrl.toString(), {logger: true})

  test('upsert with inferred table', async () => {
    const row = {
      id: '123',
      name: 'abc',
      count: 1,
      data: {hello: 'world'},
    }

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "test_user" (
        id text PRIMARY KEY,
        name text,
        count integer,
        data jsonb
      );
    `)

    await dbUpsertOne(db, 'test_user', row, {
      keyColumns: ['id'],
    })
    const {rows: ret} = await db.execute(sql`SELECT * FROM "test_user"`)

    expect(ret[0]).toEqual(row)
  })

  afterAll(async () => {
    // EDGE
    // await db.$client.end()
  })
})
