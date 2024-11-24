import type {Id, Link} from '@openint/cdk'
import {R, Rx, rxjs} from '@openint/util'
import type {DeprecatedInputEntity, RecordMessageBody} from '../def'

export function agLink(ctx: {
  source: {
    id: Id['reso']
    connectorConfig: {connectorName: string}
    metadata?: unknown
    endUserId?: string
  }
  // @ts-expect-error Remove the constraint on AnyEntityPayload
}): Link<DeprecatedInputEntity, RecordMessageBody> {
  // @ts-expect-error Remove the constraint on AnyEntityPayload
  return Rx.mergeMap((op) => {
    if (op.type !== 'data') {
      return rxjs.of(op)
    }

    const raw = op.data.entity?.raw as Record<string, unknown>

    return rxjs.from(
      R.compact([
        // TODO: only send the connection once per agLink instantiation to avoid
        // unnecessary upserts (which might actually fail due to postgres upsert not being able to
        // handle duplicates within the same transaction)
        {
          type: 'data',
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
        op.data.entityName === 'ats_candidate' && {
          type: 'data',
          data: {
            // TODO: get some strong typing here by importing from atsJob
            // perhaps this link doesn't quite belong in connectorPostgres?
            stream: 'IntegrationATSCandidate',
            data: {
              clientId: ctx.source.endUserId,
              connectionId: ctx.source.id,
              id: op.data.id,
              unified: op.data.entity?.unified,
              isOpenInt: true,
              raw,
              candidate_name: R.compact([
                raw?.['first_name'],
                raw?.['last_name'],
              ]).join(' '),
              // Should be candidate external id
              opening_external_id: raw?.['id'],
            },
          } satisfies RecordMessageBody,
        },
      ]),
    )
  })
}
