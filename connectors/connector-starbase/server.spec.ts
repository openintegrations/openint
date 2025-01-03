import {getTableName, sql} from 'drizzle-orm'
import {drizzle} from 'drizzle-orm/sqlite-proxy'
import {starbase} from 'drizzle-starbase'
import * as R from 'remeda'
import type {CustomerId} from '@openint/cdk'
import {rxjs, toCompletion} from '@openint/util'
import {inferTableFromMessage} from '../connector-postgres'
import type {RecordMessageBody} from './def'
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

// Helper to clear tables between tests
async function clearTable(tableName: string) {
  await db.run(sql`DELETE FROM ${sql.identifier(tableName)}`)
}

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
    expect(res.rows?.[0]).toMatchObject({
      source_id: 'conn_sfdc_9287',
      id: 'vend_1123',
      customer_id: 'esur_12',
      connector_name: 'sfdc',
      unified: JSON.stringify({name: 'Assets:Cash'}),
      raw: JSON.stringify({AccountName: 'Cash'}),
    })
  })
})

const messages = [
  ['insert', [{stream: 'house', data: {id: 112, name: 'White'}}]],
  // This is currently failing due to the removal of `IF NOT EXISTS` clause in drizzle-kit
  // Need to figure out if we should add it back, probably so?
  [
    'insert multiple',
    [
      {stream: 'account', data: {id: 555, name: 'Bank'}},
      {stream: 'trxn', data: {id: 555}},
    ],
  ],
  [
    'upsert single key',
    [
      {
        stream: 'tre',
        data: {id: 5, name: 'B'},
        upsert: {key_columns: ['id']},
      },
    ],
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
  //     {entityName: 'tre', entity: {id: 5, name: 'B'}, upsert: {key_columns: ['id']}},
  //     // Needs to be two batches..n in order to work due to postgres upsert cannot operate on the same row twice in one txn
  //     {entityName: 'tre', entity: {id: 5, name: 'B'}, upsert: {key_columns: ['id']}},
  //   ],
  // ],
  [
    'mixed',
    [
      {
        stream: 'good',
        data: {id: 5, name: 'B'},
        upsert: {key_columns: ['id']},
      },
      {
        stream: 'life',
        data: {id: 1, code: 'C'},
        upsert: {key_columns: ['id']},
      },
    ],
  ],
] satisfies Array<[string, Array<Omit<RecordMessageBody, 'id'>>]>

describe.each(messages)('custom schema: %s', (_, messages) => {
  const tables = messages.map((m) =>
    inferTableFromMessage(m as unknown as RecordMessageBody),
  )

  test('destinationSync', async () => {
    const src = rxjs.from([
      ...messages.map((m) => ({
        data: {id: '', ...m},
        type: 'data' as const,
      })),
      {type: 'commit' as const},
    ])
    await toCompletion(destLink(src))

    const uniqueTables = R.uniqBy(tables, (t) => getTableName(t))
    const tableRows = await Promise.all(
      uniqueTables.map((t) =>
        db.run(`SELECT * FROM ${getTableName(t)}`).then((r) => r.rows ?? []),
      ),
    )

    const rowsByTable = Object.fromEntries(
      uniqueTables.map((t, i) => [getTableName(t), tableRows[i]]),
    )

    expect(rowsByTable).toMatchSnapshot()
  })
})
