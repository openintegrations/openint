import {getTableName} from 'drizzle-orm'
import {drizzle} from 'drizzle-orm/postgres-js'
import jsonStableStringify from 'json-stable-stringify'
import * as R from 'remeda'
import type {ConnectorServer} from '@openint/cdk'
import {handlersLink} from '@openint/cdk'
import {dbUpsert} from '@openint/db'
import type {NonEmptyArray} from '@openint/util'
import {rxjs} from '@openint/util'
import {
  postgresHelpers,
  type postgresSchemas,
  type RecordMessageBody,
} from './def'
import {inferTable, runMigrationForStandardTable} from './utils'

postgresHelpers._types['destinationInputEntity'] = {
  entityName: 'string',
  entity: {raw: 'unknown', unified: 'unknown'},
  id: 'string',
}

export const postgresServer = {
  // sourceSync removed for now as it is not used yet: https://github.com/openintegrations/openint/pull/64/commits/20ef41123b1f72378e312c2c3114c462423e16e7

  destinationSync: ({customer, source, settings: {databaseUrl}}) => {
    const db = drizzle(databaseUrl, {logger: Boolean(process.env['DEBUG'])})
    const migrationRan: Record<string, boolean> = {}
    let messagesByConfig: Record<string, NonEmptyArray<RecordMessageBody>> = {}

    async function setupStandardTableIfNotExists(tableName: string) {
      if (migrationRan[tableName]) {
        return
      }
      console.log('will run migration for', tableName)
      migrationRan[tableName] = true
      await runMigrationForStandardTable(db, tableName)
    }

    return handlersLink({
      data: (op) => {
        const body =
          'entityName' in op.data
            ? ({
                namespace: undefined,
                stream: op.data.entityName,
                data: {
                  ...(op.data.entity as {}),
                  id: op.data.id,
                  customer_id: customer?.id,
                  source_id: source?.id,
                },
                upsert: {key_columns: ['source_id', 'id']},
              } satisfies RecordMessageBody)
            : op.data
        const hash = jsonStableStringify(
          R.pick(body, ['stream', 'namespace', 'upsert']),
        )
        const messages =
          messagesByConfig[hash] ??
          ([] as unknown as NonEmptyArray<RecordMessageBody>)
        messages.push(body)
        messagesByConfig[hash] = messages
        return rxjs.of(op)
      },
      commit: async (op) => {
        for (const msgs of Object.values(messagesByConfig)) {
          // TODO(p1): Infer table may NOT end up with the right schema if columns are `null` or `undefined`
          // in particular it could be hard to differentiate between a string and a jsonb column
          // We should either add some further edge case testing, ensure default behavior makes the most sense
          // or allow schema hint to be passed in as part of the message
          const table = inferTable(msgs[0])

          // This should be cached within a single destinationSync run and therefore
          // the interface of upsertFromRecordMessages may change...

          // perhaps we should make schema setup an explicit part of the process?
          await setupStandardTableIfNotExists(getTableName(table))

          // const migrations = await getMigrationsForTable(table)
          // for (const migration of migrations) {
          //   await db.execute(migration)
          // }
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
          if (msgs[0].upsert) {
            await dbUpsert(
              db,
              table,
              msgs.map((m) => m.data),
              {
                insertOnlyColumns: msgs[0].upsert?.insert_only_columns,
                keyColumns: msgs[0].upsert?.key_columns,
                mustMatchColumns: msgs[0].upsert?.must_match_columns,
                noDiffColumns: msgs[0].upsert?.no_diff_columns,
                shallowMergeJsonbColumns:
                  msgs[0].upsert?.shallow_merge_jsonb_columns,
              },
            )
          } else {
            await db.insert(table).values(msgs.map((m) => m.data))
          }
        }
        messagesByConfig = {}
        return op
      },
    })
  },
} satisfies ConnectorServer<typeof postgresSchemas>

export default postgresServer
