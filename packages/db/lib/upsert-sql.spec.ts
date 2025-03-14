import {generateDrizzleJson, generateMigration} from 'drizzle-kit/api'
import {sql} from 'drizzle-orm'
import {drizzle} from 'drizzle-orm/node-postgres'
import {
  boolean,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  serial,
  varchar,
} from 'drizzle-orm/pg-core'
import {formatSql} from '../__tests__/test-utils'
import {dbUpsert, dbUpsertOne, inferTableForUpsert} from './upsert'

const noopDb = drizzle('postgres://noop', {logger: false})

test('upsert query', async () => {
  const engagement_sequence = pgTable(
    'engagement_sequence',
    (t) => ({
      source_id: t.text().notNull(),
      // customer_id
      // integration_id
      // connector_name
      // these are all derived
      id: t.text().notNull(),
      created_at: t
        .timestamp({
          precision: 3,
          mode: 'string',
        })
        .defaultNow()
        .notNull(),
      updated_at: t
        .timestamp({
          precision: 3,
          mode: 'string',
        })
        .defaultNow()
        .notNull(),
      is_deleted: t.boolean().default(false).notNull(),
      raw: t.jsonb(),
      unified: t.jsonb(),
    }),
    (table) => ({
      primaryKey: primaryKey({
        columns: [table.source_id, table.id],
        name: 'engagement_sequence_pkey',
      }),
    }),
  )
  const query = dbUpsert(
    noopDb,
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
    noopDb,
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
  const date = new Date()
  const row = {
    id: '123',
    name: 'abc',
    count: 1,
    data: {hello: 'world'},
    arr: ['a', 'b'],
    date,
    null_value: null,
  }
  const table = inferTableForUpsert('test_user', row)
  const createTableSql = await generateMigration(
    generateDrizzleJson({}),
    generateDrizzleJson({table}),
  ).then((statements) => statements[0])
  expect(createTableSql).toMatchInlineSnapshot(`
    "CREATE TABLE "test_user" (
    	"id" text,
    	"name" text,
    	"count" text,
    	"data" jsonb,
    	"arr" jsonb,
    	"date" text,
    	"null_value" text
    );
    "
  `)

  const query = dbUpsertOne(drizzle(''), table, row, {keyColumns: ['id']})
  expect(query.toSQL().params).toEqual([
    '123',
    'abc',
    1,
    '{"hello":"world"}',
    '["a","b"]',
    date,
    null,
  ])
  expect(await formatSql(query.toSQL().sql)).toMatchInlineSnapshot(`
    "insert into
      "test_user" (
        "id",
        "name",
        "count",
        "data",
        "arr",
        "date",
        "null_value"
      )
    values
      ($1, $2, $3, $4, $5, $6, $7)
    on conflict ("id") do
    update
    set
      "name" = excluded."name",
      "count" = excluded."count",
      "data" = excluded."data",
      "arr" = excluded."arr",
      "date" = excluded."date",
      "null_value" = excluded."null_value"
    where
      (
        "test_user"."name" IS DISTINCT FROM excluded."name"
        or "test_user"."count" IS DISTINCT FROM excluded."count"
        or "test_user"."data" IS DISTINCT FROM excluded."data"
        or "test_user"."arr" IS DISTINCT FROM excluded."arr"
        or "test_user"."date" IS DISTINCT FROM excluded."date"
        or "test_user"."null_value" IS DISTINCT FROM excluded."null_value"
      )
    "
  `)
})

describe('casing cache bug', () => {
  test('repro', () => {
    const t1 = pgTable('table', (t) => ({
      id: t.text().primaryKey(),
    }))

    expect(noopDb.insert(t1).values({id: '1'}).toSQL().sql).toEqual(
      'insert into "table" ("id") values ($1)',
    )
    const t2 = pgTable('table', (t) => ({
      id: t.text().primaryKey(),
      name: t.text(),
    }))
    expect(
      noopDb.insert(t2).values({id: '1', name: 'test'}).toSQL().sql,
    ).toEqual('insert into "table" ("id", "undefined") values ($1, $2)')
  })

  test('workaround', () => {
    // explicit name setting cause the column.keyAsName to be set to false, bypassing casing cache completely
    const t1 = pgTable('table', (t) => ({
      id: t.text('id').primaryKey(),
    }))

    expect(noopDb.insert(t1).values({id: '1'}).toSQL().sql).toEqual(
      'insert into "table" ("id") values ($1)',
    )
    const t2 = pgTable('table', (t) => ({
      id: t.text('id').primaryKey(),
      name: t.text('name'),
    }))
    expect(
      noopDb.insert(t2).values({id: '1', name: 'test'}).toSQL().sql,
    ).toEqual('insert into "table" ("id", "name") values ($1, $2)')
  })
})
