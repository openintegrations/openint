import {getTableName} from 'drizzle-orm'
import {drizzle} from 'drizzle-orm/postgres-js'
import * as R from 'remeda'
import type {EndUserId} from '@openint/cdk'
import {env} from '@openint/env'
import {rxjs, toCompletion} from '@openint/util'
import type {RecordMessageBody} from './server2'
import postgresServer, {getMigrationsForTable, inferTable} from './server2'

beforeAll(async () => {
  const masterDb = drizzle(env.POSTGRES_URL, {logger: true})
  await masterDb.execute('DROP DATABASE IF EXISTS testing')
  await masterDb.execute('CREATE DATABASE testing')
  await masterDb.$client.end()
})

const dbUrl = new URL(env.POSTGRES_URL)
dbUrl.pathname = '/testing'
const db = drizzle(dbUrl.toString(), {logger: true})

const messages = [
  ['insert', [{entityName: 'account', entity: {id: 112, name: 'Cash'}}]],
  [
    'insert multiple',
    [
      {entityName: 'account', entity: {id: 555, name: 'Bank'}},
      {entityName: 'account', entity: {id: 555}},
    ],
  ],
  [
    'upsert single key',
    [
      {
        entityName: 'tre',
        entity: {id: 5, name: 'B'},
        upsert: {key_columns: ['id']},
      },
    ],
  ],
  [
    'upsert composite keys',
    [
      {
        entityName: 'transaction',
        entity: {
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
  //     {entityName: 'tre', entity: {id: 5, name: 'B'}, upsert: {key_columns: ['id']}},
  //     // Needs to be two batches..n in order to work due to postgres upsert cannot operate on the same row twice in one txn
  //     {entityName: 'tre', entity: {id: 5, name: 'B'}, upsert: {key_columns: ['id']}},
  //   ],
  // ],
  [
    'mixed',
    [
      {
        entityName: 'good',
        entity: {id: 5, name: 'B'},
        upsert: {key_columns: ['id']},
      },
      {
        entityName: 'life',
        entity: {id: 1, code: 'C'},
        upsert: {key_columns: ['id']},
      },
    ],
  ],
] satisfies Array<[string, Array<Omit<RecordMessageBody, 'id'>>]>

describe.each(messages)('postgresServer: %s', (_, messages) => {
  const tables = messages.map((m) =>
    inferTable(m as unknown as RecordMessageBody),
  )

  test('infer table schema', async () => {
    const tableMigrations = await Promise.all(
      tables.map((t) => getMigrationsForTable(t)),
    )
    expect(tableMigrations.flat()).toMatchSnapshot()
    for (const migration of tableMigrations.flat()) {
      await db.execute(migration)
    }
  })

  test('destinationSync', async () => {
    const destLink = postgresServer.destinationSync({
      config: {},
      endUser: {id: 'esur_12' as EndUserId, orgId: 'org_123'},
      settings: {databaseUrl: dbUrl.toString()},
      source: {id: 'reso_123', connectorName: 'salesforce'},
      state: {},
    })
    const src = rxjs.from([
      ...messages.map((m) => ({
        data: {id: '', ...m},
        type: 'data' as const,
      })),
      {type: 'commit' as const},
    ])

    await toCompletion(destLink(src))

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
})

afterAll(() => db.$client.end())
