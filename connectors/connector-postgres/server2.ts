import {generateDrizzleJson, generateMigration} from 'drizzle-kit/api'
import type {PgColumn, PgTable} from 'drizzle-orm/pg-core'
import {pgTable, uniqueIndex} from 'drizzle-orm/pg-core'
import {drizzle} from 'drizzle-orm/postgres-js'
import jsonStableStringify from 'json-stable-stringify'
import * as R from 'remeda'
import type {z} from 'zod'
import type {ConnectorServer} from '@openint/cdk'
import {handlersLink} from '@openint/cdk'
import {dbUpsert} from '@openint/db'
import type {NonEmptyArray} from '@openint/util'
import {rxjs} from '@openint/util'
import type {postgresSchemas, zRecordMessageBody} from './def'
import {isValidDateString} from './utils'

export type RecordMessageBody = z.infer<typeof zRecordMessageBody>

/**
 * We probably want something based off of the Catalog protocol, by inferring catalog
 * from data object and then generating a migration from the catalog message as a two step,
 * unified process.
 * For now we just do something lightweig thought
 */
export function inferTable(event: RecordMessageBody) {
  // TODO Implement namespace and upsert metadata support
  return pgTable(
    event.entityName,
    (t) => {
      function inferCol(v: unknown) {
        if (typeof v === 'string') {
          return isValidDateString(v) ? t.timestamp() : t.text()
        }
        if (typeof v === 'number') {
          return Math.floor(v) === v ? t.integer() : t.doublePrecision()
        }
        if (typeof v === 'boolean') {
          return t.boolean()
        }
        if (v instanceof Date) {
          return t.timestamp()
        }
        return t.jsonb()
      }
      return Object.fromEntries(
        Object.entries(event.entity).map(([k, v]) => [k, inferCol(v)]),
      )
    },
    (table) =>
      // TODO: Check against existing primary key and unique indexes
      // to not create if already there?
      // && Object.values(table).filter(c => c.i)
      event.upsert?.key_columns
        ? [
            uniqueIndex(`${event.entityName}_upsert_keys`).on(
              ...(event.upsert.key_columns.map(
                (col) => table[col] as PgColumn,
              ) as [PgColumn]),
            ),
          ]
        : [],
  )
}

export function getMigrationsForTable(table: PgTable) {
  return generateMigration(
    generateDrizzleJson({}),
    generateDrizzleJson({table}),
  )
}

export const postgresServer = {
  destinationSync: ({endUser, source, settings: {databaseUrl}}) => {
    const db = drizzle(databaseUrl, {logger: true})
    const messagesByConfig: Record<
      string,
      NonEmptyArray<RecordMessageBody>
    > = {}

    return handlersLink({
      data: (op) => {
        const body = op.data as RecordMessageBody
        const hash = jsonStableStringify(
          R.pick(body, ['entityName', 'namespace', 'upsert']),
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
          const table = inferTable(msgs[0])

          // This should be cached within a single destinationSync run and therefore
          // the interface of upsertFromRecordMessages may change...
          const migrations = await getMigrationsForTable(table)
          for (const migration of migrations) {
            await db.execute(migration)
          }
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
              msgs.map((m) => m.entity),
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
            await db.insert(table).values(msgs.map((m) => m.entity))
          }
        }
        return op
      },
    })
  },
} satisfies ConnectorServer<typeof postgresSchemas>

export default postgresServer
