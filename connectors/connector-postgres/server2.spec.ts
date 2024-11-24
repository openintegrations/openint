import {getTableName} from 'drizzle-orm'
import {drizzle} from 'drizzle-orm/postgres-js'
import * as R from 'remeda'
import {env} from '@openint/env'
import type {RecordMessage} from './server2'
import {
  getMigrationsForTable,
  inferTable,
  upsertFromRecordMessages,
} from './server2'

beforeAll(async () => {
  const masterDb = drizzle(env.POSTGRES_URL, {logger: true})
  await masterDb.execute('DROP DATABASE IF EXISTS testing')
  await masterDb.execute('CREATE DATABASE testing')
  await masterDb.$client.end()
})

const dbUrl = new URL(env.POSTGRES_URL)
dbUrl.pathname = '/testing'
const db = drizzle(dbUrl.toString(), {logger: true})

describe.each([
  ['insert', [{stream: 'account', data: {id: 112, name: 'Cash'}}]],
  [
    'insert multiple',
    [
      {stream: 'account', data: {id: 555, name: 'Bank'}},
      {stream: 'account', data: {id: 555}},
    ],
  ],
  [
    'upsert single key',
    [{stream: 'tre', data: {id: 5, name: 'B'}, upsert: {key_columns: ['id']}}],
  ],
  [
    'upsert composite keys',
    [
      {
        stream: 'transaction',
        data: {
          id: '1',
          intId: 2,
          amount: 1.23,
          is_deleted: false,
          raw: {key: 'value'},
          array_value: [{key: 'value'}],
          null_value: null,
          undefined_value: undefined, // undefined gets turned into null... but should we allowe for it?
          // created_at: '2021-01-01T00:00:00Z', // this colun also causes problem for now
          // uupdated_at: new Date(), // Should we allow non-json values?
        },
        upsert: {
          key_columns: ['id', 'is_deleted'],
        },
      },
    ],
  ],
  // [
  //   'upsert multiple single key',
  //   [
  //     {stream: 'tre', data: {id: 5, name: 'B'}, upsert: {key_columns: ['id']}},
  //     // Needs to be two batches..n in order to work due to postgres upsert cannot operate on the same row twice in one txn
  //     {stream: 'tre', data: {id: 5, name: 'B'}, upsert: {key_columns: ['id']}},
  //   ],
  // ],
  [
    'mixed',
    [
      {stream: 'good', data: {id: 5, name: 'B'}, upsert: {key_columns: ['id']}},
      {stream: 'life', data: {id: 1, code: 'C'}, upsert: {key_columns: ['id']}},
    ],
  ],
] satisfies Array<[string, RecordMessage[]]>)(
  'processEvents %s',
  (_, messages) => {
    const tables = messages.map((m) => inferTable(m))

    test('infer table schema', async () => {
      const tableMigrations = await Promise.all(
        tables.map((t) => getMigrationsForTable(t)),
      )
      expect(tableMigrations.flat()).toMatchSnapshot()
      for (const migration of tableMigrations.flat()) {
        await db.execute(migration)
      }
    })

    test('upsert from message', async () => {
      await upsertFromRecordMessages(db, messages)

      const uniqueTables = R.uniqBy(tables, (t) => getTableName(t))
      console.log({
        uniqueTables: uniqueTables.length,
        names: tables.map((t) => getTableName(t)),
      })

      const tableRows = await Promise.all(
        uniqueTables.map((t) => db.select().from(t).execute()),
      )

      const rowsByTable = Object.fromEntries(
        uniqueTables.map((t, i) => [getTableName(t), tableRows[i]]),
      )

      expect(rowsByTable).toMatchSnapshot()

      // for (const [index, message] of messages.entries()) {
      //   // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      //   const table = tables[index]!
      //   // This wont' work for multiple.. in same table.. need to see.
      //   const rows = await db.select().from(table).execute()
      //   // expect(rows[0]).toEqual(message.data)
      // }
    })
  },
)

afterAll(() => db.$client.end())
