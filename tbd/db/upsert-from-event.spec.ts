import {generateDrizzleJson, generateMigration} from 'drizzle-kit/api'
import type {PgDatabase} from 'drizzle-orm/pg-core'
import {drizzle} from 'drizzle-orm/postgres-js'
import {env} from '@openint/env'
import {z} from '@openint/util'
import {dbUpsertOne} from './upsert'
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

/** Airbyte record message */
const zRecordMessage = z.object({
  stream: z.string(),
  // Should we support non-record data?
  data: z.record(z.unknown()),
  namespace: z.string().optional(),
  upsert: z
    .object({
      insert_only_columns: z.array(z.string()),
      key_columns: z.array(z.string()),
      must_match_columns: z.array(z.string()),
      no_diff_columns: z.array(z.string()),
      shallow_merge_jsonb_columns: z.array(z.string()),
    })
    .optional(),
})

function upsertFromRecordMessage(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  db: PgDatabase<any, any>,
  message: z.infer<typeof zRecordMessage>,
) {
  const table = inferTable({stream: message.stream, data: message.data})

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

const message: z.infer<typeof zRecordMessage> = {
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
}
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

afterAll(() => db.$client.end())
