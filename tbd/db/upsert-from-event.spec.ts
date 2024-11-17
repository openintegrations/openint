import {generateDrizzleJson, generateMigration} from 'drizzle-kit/api'
import {type PgDatabase} from 'drizzle-orm/pg-core'
import {drizzle} from 'drizzle-orm/postgres-js'
import {env} from '@openint/env'
import {dbUpsertOne} from './upsert'
import type {RecordMessage} from './upsert-from-event'
import {inferTable, isValidDateString} from './upsert-from-event'

beforeAll(async () => {
  const masterDb = drizzle(env.POSTGRES_URL, {logger: true})
  await masterDb.execute('DROP DATABASE IF EXISTS testing')
  await masterDb.execute('CREATE DATABASE testing')
  await masterDb.$client.end()
})

const dbUrl = new URL(env.POSTGRES_URL)
dbUrl.pathname = '/testing'
const db = drizzle(dbUrl.toString(), {logger: true})

test.each([
  ['2021-01-01T00:00:00Z', true],
  ['2021-01-01T00:00:00', false], // missing timezone, not valid as a result
  ['2021-01-01', true],
  ['2021-01', true],
  ['2021', true],
  ['12', false],
  ['202', false],
  ['2021-01-01T00:00:00+00:00', true],
  ['Sun, Nov 17, 5:00 PM', false],
  ['Sat Nov 16 2024 15:28:04 GMT-0800 (Pacific Standard Time)', false],
])('isValidDateString(%s) -> %o', (input, valid) => {
  expect(isValidDateString(input)).toEqual(valid)
})

function upsertFromRecordMessage(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  db: PgDatabase<any, any>,
  message: RecordMessage,
) {
  const table = inferTable({stream: message.stream, data: message.data})
  // This doesn't work because upsert needs reference to table column to know how to
  // serialize value, For example string into jsonb is not the same as string into a text
  // column. So it's actually somewhat important to get reference to the table schema
  // rather than needing to infer it each time.
  // const table2 = pgTable(
  //   message.stream,
  //   (t) =>
  //     Object.fromEntries(
  //       Object.keys(message.data).map((k) => [k, t.jsonb()]),
  //     ) as Record<string, any>,
  // )
  if (message.upsert) {
    return dbUpsertOne(db, table, message.data, {
      insertOnlyColumns: message.upsert?.insert_only_columns,
      keyColumns: message.upsert?.key_columns,
      mustMatchColumns: message.upsert?.must_match_columns,
      noDiffColumns: message.upsert?.no_diff_columns,
      shallowMergeJsonbColumns: message.upsert?.shallow_merge_jsonb_columns,
    })
  }
  return db.insert(table).values(message.data)
}

describe.each([
  ['insert', {stream: 'account', data: {id: 112, name: 'Cash'}}],
  [
    'upsert on single column',
    {stream: 'tre', data: {id: 5, name: 'B'}, upsert: {key_columns: ['id']}},
  ],
  [
    'upsert on multiple cols',
    {
      stream: 'transaction',
      data: {
        id: '1',
        intId: 2,
        amount: 1.23,
        // created_at: '2021-01-01T00:00:00Z', // this colun also causes problem for now
        // uupdated_at: new Date(), // Should we allow non-json values?
        is_deleted: false,
        raw: {key: 'value'},
        array_value: [{key: 'value'}],
      },
      upsert: {
        key_columns: ['id', 'is_deleted'],
      },
    },
  ],
] satisfies Array<[string, RecordMessage]>)(
  'upsertFromEvent %s',
  (_, message) => {
    const table = inferTable(message)

    test('infer table schema', async () => {
      const migrations = await generateMigration(
        generateDrizzleJson({}),
        generateDrizzleJson({table}),
      )
      expect(migrations).toMatchSnapshot()
      for (const migration of migrations) {
        await db.execute(migration)
      }
    })

    test('upsert from message', async () => {
      await upsertFromRecordMessage(db, message)
      const rows = await db.select().from(table).execute()
      expect(rows[0]).toEqual(message.data)
    })
  },
)

afterAll(() => db.$client.end())
