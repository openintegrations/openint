import type {Id, Link} from '@openint/cdk'
import type {
  DeprecatedInputEntity,
  RecordMessageBody,
} from '@openint/connector-postgres'
import type {Unified} from '@openint/unified-ats'
import {R, Rx, rxjs} from '@openint/util'

/** no ats prefix here */
function isUnifiedEntity<T extends keyof Unified>(
  entity: DeprecatedInputEntity,
  name: T,
): entity is {
  id: string
  entityName: `${T}`
  entity: {raw?: unknown; unified: Unified[T]}
} {
  return (
    entity.entityName === `${name}` &&
    entity.entity != null &&
    'unified' in entity.entity
  )
}

/** TODO: Rename me to customLinkAg */
export function agLink(ctx: {
  source: {
    id: Id['reso']
    connectorConfig: {connectorName: string}
    metadata?: unknown
    endUserId?: string | null
  }
}): Link<DeprecatedInputEntity, RecordMessageBody> {
  let integrationConnectionUpserted = false
  return Rx.mergeMap((op) => {
    if (op.type !== 'data') {
      return rxjs.of(op)
    }

    const raw = op.data?.entity?.raw as Record<string, unknown>

    // console.log('raw data for agLink', op.data.entityName)
    // TODO: Auto generate typescript types from the database schema
    // to help validate our insertions, could also be used for agLink.spec.ts

    const messages = rxjs.from(
      R.compact([
        // TODO: only send the connection once per agLink instantiation to avoid
        // unnecessary upserts (which might actually fail due to postgres upsert not being able to
        // handle duplicates within the same transaction)
        !integrationConnectionUpserted && {
          type: 'data' as const,
          data: {
            stream: 'IntegrationConnection',
            data: {
              clientId: ctx.source.endUserId,
              id: ctx.source.id,
              provider: ctx.source.connectorConfig.connectorName, // greenhouse, lever, etc
              label: 'OpenInt',
              profile: 'Ats', // TODO: make this configurable or let atsLink pass this data down...
              source: 'OpenInt',
            },
            upsert: {key_columns: ['id']},
          } satisfies RecordMessageBody,
        },
        isUnifiedEntity(op.data, 'candidate') && {
          type: 'data' as const,
          data: {
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
              candidate_external_id:
                op.data.entity.unified.id ??
                (op.data.entity.raw as any)?.['id'] ??
                '',
            },
            upsert: {key_columns: ['id']},
          } satisfies RecordMessageBody,
        },
        isUnifiedEntity(op.data, 'job') && {
          type: 'data' as const,
          data: {
            stream: 'IntegrationATSJob',
            data: {
              clientId: ctx.source.endUserId,
              connectionId: ctx.source.id,
              id: op.data.id,
              external_job_id: op.data.entity?.unified.id,
              isOpenInt: true,
              raw: op.data.entity?.raw,
              unified: op.data.entity?.unified,
            },
            upsert: {key_columns: ['id']},
          } satisfies RecordMessageBody,
        },
        isUnifiedEntity(op.data, 'offer') && {
          type: 'data' as const,
          data: {
            stream: 'IntegrationATSOffer',
            data: {
              clientId: ctx.source.endUserId,
              connectionId: ctx.source.id,
              id: op.data.id,
              raw: op.data.entity?.raw,
              unified: op.data.entity?.unified,
              isOpenInt: true,
              opening_external_id: op.data.entity?.unified.id,
              // there is no candidate name in offer
              candidate_name: '',
            },
            upsert: {key_columns: ['id']},
          } satisfies RecordMessageBody,
        },
        isUnifiedEntity(op.data, 'opening') && {
          type: 'data' as const,
          data: {
            stream: 'IntegrationATSOpening',
            data: {
              clientId: ctx.source.endUserId,
              connectionId: ctx.source.id,
              id: op.data.id,
              raw: op.data.entity?.raw,
              unified: op.data.entity?.unified,
              isOpenInt: true,
              opening_external_id:
                op.data.entity?.unified?.id || raw?.['opening_id'] || '',
              job_id: raw?.['job_id'] || '',
            },
            upsert: {key_columns: ['id']},
          } satisfies RecordMessageBody,
        },
      ]),
    )

    integrationConnectionUpserted = true

    return messages
  })
}
