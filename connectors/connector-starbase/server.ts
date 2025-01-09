import {getTableName} from 'drizzle-orm'
import jsonStableStringify from 'json-stable-stringify'
import * as R from 'remeda'
import type {ConnectorServer} from '@openint/cdk'
import {handlersLink} from '@openint/cdk'
import {
  dbUpsertStarbase,
  runMigrationForStandardTableStarbase,
} from '@openint/db'
import type {NonEmptyArray} from '@openint/util'
import {rxjs} from '@openint/util'
import {inferTableFromMessage} from '../connector-postgres'
import {
  postgresHelpers,
  type RecordMessageBody,
  type starbaseSchemas,
} from './def'

postgresHelpers._types['destinationInputEntity'] = {
  entityName: 'string',
  entity: {raw: 'unknown', unified: 'unknown'},
  id: 'string',
}

export const starbaseServer = {
  destinationSync: ({customer, source}) => {
    const migrationRan: Record<string, boolean> = {}
    let messagesByConfig: Record<string, NonEmptyArray<RecordMessageBody>> = {}

    async function setupStandardTableIfNotExists(tableName: string) {
      if (migrationRan[tableName]) {
        return
      }
      console.log('will run starbase migration for', tableName)
      migrationRan[tableName] = true
      await runMigrationForStandardTableStarbase(tableName)
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
          const table = inferTableFromMessage(msgs[0])

          // is this required ?
          await setupStandardTableIfNotExists(getTableName(table))

          if (msgs[0].upsert) {
            await dbUpsertStarbase(
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
            await dbUpsertStarbase(
              table,
              msgs.map((m) => m.data),
            )
          }
        }
        messagesByConfig = {}
        return op
      },
    })
  },
} satisfies ConnectorServer<typeof starbaseSchemas>

export default starbaseServer
