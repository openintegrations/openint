import {generateDrizzleJson, generateMigration} from 'drizzle-kit/api'
import {getTableName} from 'drizzle-orm'
import type {PgTable} from 'drizzle-orm/pg-core'
import {drizzle} from 'drizzle-orm/postgres-js'
import * as R from 'remeda'
import type {CustomerId} from '@openint/cdk'
import {env} from '@openint/env'
import {rxjs, toCompletion} from '@openint/util'
import type {RecordMessageBody} from './def'
import postgresServer from './server'
import {inferTableFromMessage} from './utils'

/**
 * Causes issue with next.js build... so putting it here for now since we are not quite using it in prod yet
 * TODO: Report issue to drizzle about this
../../node_modules/.pnpm/esbuild@0.17.5/node_modules/esbuild/lib/main.d.ts
Module parse failed: Unexpected token (1:7)
File was processed with these loaders:
 * ../../node_modules/.pnpm/next@14.2.13_@babel+core@7.25.2_@opentelemetry+api@1.9.0_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/build/webpack/loaders/next-flight-loader/index.js
 * ../../node_modules/.pnpm/next@14.2.13_@babel+core@7.25.2_@opentelemetry+api@1.9.0_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/build/webpack/loaders/next-swc-loader.js
You may need an additional loader to handle the result of these loaders.
> export type Platform = 'browser' | 'node' | 'neutral'
| export type Format = 'iife' | 'cjs' | 'esm'
| export type Loader = 'base64' | 'binary' | 'copy' | 'css' | 'dataurl' | 'default' | 'empty' | 'file' | 'js' | 'json' | 'jsx' | 'text' | 'ts' | 'tsx'

Import trace for requested module:
../../node_modules/.pnpm/esbuild@0.17.5/node_modules/esbuild/lib/main.d.ts
../../node_modules/.pnpm/esbuild@0.17.5/node_modules/esbuild/lib/ sync ^.*\/.*$
../../node_modules/.pnpm/esbuild@0.17.5/node_modules/esbuild/lib/main.js
../../node_modules/.pnpm/esbuild-register@3.5.0_esbuild@0.17.5/node_modules/esbuild-register/dist/node.js
../../node_modules/.pnpm/drizzle-kit@0.28.1/node_modules/drizzle-kit/api.mjs
../../connectors/connector-postgres/utils.ts
../../connectors/connector-postgres/server.ts
../app-config/connectors/connectors.merged.ts
../app-config/backendConfig.ts
./app/api/connections/[connectionId]/sql/route.ts

 */
function getMigrationsForTable(table: PgTable) {
  return generateMigration(
    generateDrizzleJson({}),
    generateDrizzleJson({table}),
  )
}

// console.log('filename', __filename)
const dbName = 'connector_postgres'

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

const destLink = postgresServer.destinationSync({
  config: {},
  customer: {id: 'esur_12' as CustomerId, orgId: 'org_123'},
  settings: {databaseUrl: dbUrl.toString()},
  source: {id: 'conn_sfdc_9287', connectorName: 'sfdc'},
  state: {},
})

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
    const res = await db.execute('SELECT * FROM vendor')
    expect(res[0]).toMatchObject({
      source_id: 'conn_sfdc_9287',
      id: 'vend_1123',
      customer_id: 'esur_12',
      connector_name: 'sfdc',
      unified: {name: 'Assets:Cash'},
      raw: {AccountName: 'Cash'},
      // Should be any ISODate
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      created_at: expect.any(String),
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      updated_at: expect.any(String),
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
