import {drizzle} from 'drizzle-orm/sqlite-proxy'
import {starbase} from 'drizzle-starbase'
import type {CustomerId} from '@openint/cdk'
import {rxjs, toCompletion} from '@openint/util'
import starbaseServer from './server'

const STARBASE_ENDPOINT = process.env['STARBASE_ENDPOINT']!
const STARBASE_AUTH_TOKEN = process.env['STARBASE_AUTH_TOKEN']!

/**
 * Not working due to nextjs issue
 */
const db = drizzle(...starbase(STARBASE_ENDPOINT, STARBASE_AUTH_TOKEN))

const destLink = starbaseServer.destinationSync({
  config: {},
  customer: {id: 'esur_12' as CustomerId, orgId: 'org_123'},
  settings: {
    databaseUrl: STARBASE_ENDPOINT,
  },
  source: {id: 'conn_sfdc_9287', connectorName: 'sfdc'},
  state: {},
})

const isValidDate = expect.stringMatching(
  /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/,
)

describe('standard schema', () => {
  test('destinationSync', async () => {
    const src = rxjs.from([
      {
        data: {
          entityName: 'vendor',
          id: 'vend_1123',
          entity: {
            raw: {AccountName: 'Cash'},
            unified: {name: 'Assets:Cash'},
          },
        },
        type: 'data' as const,
      },
      {type: 'commit' as const},
    ])
    await toCompletion(destLink(src))

    const res = await db.run(`SELECT * FROM vendor WHERE id = 'vend_1123'`)
    console.log('res', res)
    expect(Object.values(res.rows?.[0] ?? {})).toEqual([
      'conn_sfdc_9287',
      'vend_1123',
      'esur_12',
      isValidDate,
      isValidDate,
      null,
      JSON.stringify({name: 'Assets:Cash'}),
      JSON.stringify({AccountName: 'Cash'}),
    ])
  })
})

// const messages = [
//   ['insert', [{stream: 'house', data: {id: 112, name: 'White'}}]],
//   // This is currently failing due to the removal of `IF NOT EXISTS` clause in drizzle-kit
//   // Need to figure out if we should add it back, probably so?
//   [
//     'insert multiple',
//     [
//       {stream: 'account', data: {id: 555, name: 'Bank'}},
//       {stream: 'trxn', data: {id: 555}},
//     ],
//   ],
//   [
//     'upsert single key',
//     [
//       {
//         stream: 'tre',
//         data: {id: 5, name: 'B'},
//         upsert: {key_columns: ['id']},
//       },
//     ],
//   ],
//   [
//     'upsert composite keys',
//     [
//       {
//         stream: 'transaction',
//         data: {
//           id: '1',
//           intId: 2,
//           amount: 1.23,
//           is_deleted: false,
//           raw: {key: 'value'},
//           array_value: [{key: 'value'}],
//           null_value: null,
//           undefined_value: undefined, // undefined gets turned into null... but should we allowe for it?
//           // created_at: '2021-01-01T00:00:00Z', // this colun also causes problem for now
//           // uupdated_at: new Date(), // Should we allow non-json values?
//         },
//         upsert: {
//           key_columns: ['id', 'is_deleted'],
//         },
//       },
//     ],
//   ],
//   // [
//   //   'upsert multiple single key',
//   //   [
//   //     {entityName: 'tre', entity: {id: 5, name: 'B'}, upsert: {key_columns: ['id']}},
//   //     // Needs to be two batches..n in order to work due to postgres upsert cannot operate on the same row twice in one txn
//   //     {entityName: 'tre', entity: {id: 5, name: 'B'}, upsert: {key_columns: ['id']}},
//   //   ],
//   // ],
//   [
//     'mixed',
//     [
//       {
//         stream: 'good',
//         data: {id: 5, name: 'B'},
//         upsert: {key_columns: ['id']},
//       },
//       {
//         stream: 'life',
//         data: {id: 1, code: 'C'},
//         upsert: {key_columns: ['id']},
//       },
//     ],
//   ],
// ] satisfies Array<[string, Array<Omit<RecordMessageBody, 'id'>>]>

// describe.each(messages)('custom schema: %s', (_, messages) => {
//   const tables = messages.map((m) =>
//     inferTableFromMessage(m as unknown as RecordMessageBody),
//   )

//   test('destinationSync', async () => {
//     const src = rxjs.from([
//       ...messages.map((m) => ({
//         data: {id: '', ...m},
//         type: 'data' as const,
//       })),
//       {type: 'commit' as const},
//     ])
//     await toCompletion(destLink(src))

//     const uniqueTables = R.uniqBy(tables, (t) => getTableName(t))
//     const tableRows = await Promise.all(
//       uniqueTables.map((t) =>
//         db.run(`SELECT * FROM ${getTableName(t)}`).then((r) => r.rows ?? []),
//       ),
//     )

//     const rowsByTable = Object.fromEntries(
//       uniqueTables.map((t, i) => [getTableName(t), tableRows[i]]),
//     )
//     console.log('rowsByTable', rowsByTable)

//     expect(rowsByTable).toMatchSnapshot()
//   })
// })
