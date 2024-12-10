/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import * as rxjs from 'rxjs'
import * as Rx from 'rxjs/operators'
import type {AnyEntityPayload, Id, Link} from '@openint/cdk'
import type {postgresHelpers} from '@openint/connector-postgres'
import {applyMapper} from '@openint/vdk'
import {hubspotSingularMappers} from './adapters/hubspot-adapter/mappers'
import {mappers as salesforceMappers} from './adapters/salesforce-adapter/mappers'

type PostgresInputPayload =
  (typeof postgresHelpers)['_types']['destinationInputEntity']

export function unifiedCrmLink(ctx: {
  source: {
    id: Id['conn']
    connectorConfig: {connectorName: string}
    metadata?: unknown
  }
}): Link<AnyEntityPayload, PostgresInputPayload> {
  return Rx.mergeMap((op) => {
    if (op.type !== 'data') {
      return rxjs.of(op)
    }

    // QQ. Why doesn't import mappers work? TODO; generalize
    const mappers =
      ctx.source.connectorConfig.connectorName === 'hubspot'
        ? hubspotSingularMappers
        : salesforceMappers

    const entityName = op.data.entityName
    const mapper = mappers[entityName as keyof typeof mappers]
    if (!mapper) {
      console.warn(
        `No ${entityName} entity mapper found for connector: ${ctx.source.connectorConfig.connectorName}`,
        JSON.stringify(mappers),
      )
      return rxjs.EMPTY
    }

    const mapped = applyMapper(mapper, op.data.entity as any)

    return rxjs.of({
      ...op,
      data: {
        id: mapped.id,
        entityName,
        entity: {raw: op.data.entity, unified: mapped},
      },
    })
  })
}
