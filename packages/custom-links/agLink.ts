import type {Id, Link} from '@openint/cdk'
import type {
  DeprecatedInputEntity,
  RecordMessageBody,
} from '@openint/connector-postgres'
import type {Unified} from '@openint/unified-ats'
import {R, Rx, rxjs} from '@openint/util'
import {entityCommands} from '@/vcommands/vcommand-definitions'

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
  let integrationConnectionUpserted = false
  return Rx.mergeMap((op) => {
    if (op.type !== 'data') {
      return rxjs.of(op)
    }

    const raw = op.data?.entity?.raw as Record<string, unknown>

    console.log('raw data for agLink', op.data.entityName)
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
              provider: 'openint',
              label: 'OpenInt',
              profile: 'Ats', // TODO: make this configurable or let atsLink pass this data down...
              source: 'OpenInt',
            },
            upsert: {
              key_columns: ['id'],
            },
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
              // Should be candidate external id
              opening_external_id: op.data.entity.unified.id,
            },
            upsert: {
              key_columns: ['id'],
            },
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
            upsert: {
              key_columns: ['id'],
            },
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
            upsert: {
              key_columns: ['id'],
            },
          } satisfies RecordMessageBody,
        },
        isUnifiedEntity(op.data, 'opening') && {
          type: 'data' as const,
          data: {
            stream: 'IntegrationATSOpportunity',
            data: {
              clientId: ctx.source.endUserId,
              connectionId: ctx.source.id,
              id: op.data.id,
              raw: op.data.entity?.raw,
              unified: op.data.entity?.unified,
              isOpenInt: true,
              opening_external_id: raw?.['opening_id'] || '',
              job_id: raw?.['job_id'] || '',
            },
            upsert: {
              key_columns: ['id'],
            },
          } satisfies RecordMessageBody,
        },
      ]),
    )

    integrationConnectionUpserted = true

    return messages
  })
}

;[
  {
    column_name: 'updatedAt',
    data_type: 'timestamp without time zone',
    is_nullable: 'YES',
    character_maximum_length: null,
  },
  {
    column_name: 'isOpenInt',
    data_type: 'boolean',
    is_nullable: 'YES',
    character_maximum_length: null,
  },
  {
    column_name: 'raw',
    data_type: 'jsonb',
    is_nullable: 'NO',
    character_maximum_length: null,
  },
  {
    column_name: 'unified',
    data_type: 'jsonb',
    is_nullable: 'NO',
    character_maximum_length: null,
  },
  {
    column_name: 'createdAt',
    data_type: 'timestamp without time zone',
    is_nullable: 'NO',
    character_maximum_length: null,
  },
  {
    column_name: 'clientId',
    data_type: 'text',
    is_nullable: 'NO',
    character_maximum_length: null,
  },
  {
    column_name: 'connectionId',
    data_type: 'text',
    is_nullable: 'NO',
    character_maximum_length: null,
  },
  {
    column_name: 'external_job_id',
    data_type: 'text',
    is_nullable: 'NO',
    character_maximum_length: null,
  },
  {
    column_name: 'id',
    data_type: 'text',
    is_nullable: 'NO',
    character_maximum_length: null,
  },
]
