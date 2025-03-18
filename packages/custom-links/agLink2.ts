import type {Id, Link} from '@openint/cdk'
import type {
  DeprecatedInputEntity,
  RecordMessageBody,
} from '@openint/connector-postgres'
import {R, Rx, rxjs} from '@openint/util'

/** no ats prefix here */
function isUnifiedEntity(entity: DeprecatedInputEntity): entity is {
  id: string
  entityName: string
  entity: {raw?: unknown; unified: Record<string, undefined>}
} {
  return (
    typeof entity.entityName === 'string' &&
    entity.entity != null &&
    'unified' in entity.entity
  )
}

/** TODO: Rename me to customLinkAg2 */
export function agLink2(ctx: {
  source: {
    id: Id['conn']
    connectorConfig: {connectorName: string}
    metadata?: unknown
    customerId?: string | null
  }
}): Link<DeprecatedInputEntity, RecordMessageBody> {
  let sourceConnectionUpserted = false
  return Rx.mergeMap((op) => {
    if (op.type !== 'data') {
      return rxjs.of(op)
    }

    // console.log('raw data for agLink', op.data.entityName)
    // TODO: Auto generate typescript types from the database schema
    // to help validate our insertions, could also be used for agLink.spec.ts

    const messages = rxjs.from(
      R.compact([
        // TODO: only send the connection once per agLink instantiation to avoid
        // unnecessary upserts (which might actually fail due to postgres upsert not being able to
        // handle duplicates within the same transaction)
        !sourceConnectionUpserted && {
          type: 'data' as const,
          data: {
            stream: 'sourceConnection',
            data: {
              clientId: ctx.source.customerId,
              id: ctx.source.id,
              provider: ctx.source.connectorConfig.connectorName, // greenhouse, lever, etc
              label: ctx.source.connectorConfig.connectorName, // greenhouse, lever, etc,
              profile: 'Ats', // TODO: make this configurable or let atsLink pass this data down...
              source: 'OpenInt',
            },
            upsert: {key_columns: ['id']},
          } satisfies RecordMessageBody,
        },
        isUnifiedEntity(op.data) && {
          type: 'data' as const,
          data: {
            stream: 'syncedData',
            data: {
              clientId: ctx.source.customerId,
              sourceConnectionId: ctx.source.id,
              sourceId: op.data.id,
              rawData: op.data.entity?.raw,
            },
            upsert: {key_columns: ['sourceConnectionId', 'sourceId']},
          } satisfies RecordMessageBody,
        },
      ]),
    )

    sourceConnectionUpserted = true

    return messages
  })
}
