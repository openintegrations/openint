import type {Id, Link} from '@openint/cdk'
import type {
  DeprecatedInputEntity,
  RecordMessageBody,
} from '@openint/connector-postgres'
import type {Unified} from '@openint/unified-ats'
import {R, Rx, rxjs} from '@openint/util'

function isUnifiedEntity<T extends keyof Unified>(
  entity: DeprecatedInputEntity,
  name: T,
): entity is {
  id: string
  entityName: `ats_${T}`
  entity: {raw?: unknown; unified: Unified[T]}
} {
  return (
    entity.entityName === `ats_${name}` &&
    entity.entity != null &&
    'unified' in entity.entity
  )
}

export function agLink(ctx: {
  source: {
    id: Id['reso']
    connectorConfig: {connectorName: string}
    metadata?: unknown
    endUserId?: string
  }
}): Link<DeprecatedInputEntity, RecordMessageBody> {
  return Rx.mergeMap((op) => {
    if (op.type !== 'data') {
      return rxjs.of(op)
    }

    return rxjs.from(
      R.compact([
        // TODO: only send the connection once per agLink instantiation to avoid
        // unnecessary upserts (which might actually fail due to postgres upsert not being able to
        // handle duplicates within the same transaction)
        {
          type: 'data' as const,
          data: {
            stream: 'IntegrationConnection',
            data: {
              clientId: ctx.source.endUserId,
              id: ctx.source.id,
              provider: 'openint',
              label: 'OpenInt',
              profile: 'Ats', // TODO: make this configurable or let atsLink pass this data down...
              source: 'OpenInt',
            },
          } satisfies RecordMessageBody,
        },
        isUnifiedEntity(op.data, 'candidate') && {
          type: 'data' as const,
          data: {
            // TODO: get some strong typing here by importing from atsJob
            // perhaps this link doesn't quite belong in connectorPostgres?
            stream: 'IntegrationATSCandidate',
            data: {
              clientId: ctx.source.endUserId,
              connectionId: ctx.source.id,
              id: op.data.id,
              raw: op.data.entity?.raw,
              unified: op.data.entity?.unified,
              isOpenInt: true,
              candidate_name: R.compact([
                op.data.entity.unified.first_name,
                op.data.entity.unified.last_name,
              ]).join(' '),
              // Should be candidate external id
              opening_external_id: op.data.entity.unified.id,
            },
          } satisfies RecordMessageBody,
        },
      ]),
    )
  })
}
