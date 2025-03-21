/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import * as rxjs from 'rxjs'
import * as Rx from 'rxjs/operators'
import type {AnyEntityPayload, Id, Link} from '@openint/cdk'
import type {
  postgresHelpers,
  RecordMessageBody,
} from '@openint/connector-postgres'
import {applyMapper} from '@openint/vdk'
import {mappers as plaidMapper} from './adapters/plaid-adapter/mapper'
import {mappers as qboMapper} from './adapters/qbo-adapter/mapper'

type PostgresInputPayload =
  (typeof postgresHelpers)['_types']['destinationInputEntity']

export function unifiedAccountingLink(ctx: {
  source: {
    id: Id['conn']
    connectorConfig: {connectorName: string}
    metadata?: unknown
    customerId?: string | null
  }
}): Link<AnyEntityPayload, PostgresInputPayload> {
  return Rx.mergeMap((op) => {
    if (op.type !== 'data') {
      return rxjs.of(op)
    }

    // TODO; generalize
    const mappers =
      ctx.source.connectorConfig.connectorName === 'qbo'
        ? qboMapper
        : plaidMapper

    const entityName = op.data.entityName
    // @ts-expect-error for now
    const mapper = mappers[entityName]
    if (!mapper) {
      console.warn(
        `No ${entityName} entity mapper found for connector: ${ctx.source.connectorConfig.connectorName}`,
        JSON.stringify(mappers),
      )
      return rxjs.EMPTY
    }

    // TODO: Should build this into the mapper itself
    const stream =
      {
        // QBO
        Purchase: 'transaction',
        JournalEntry: 'transaction',
        Deposit: 'transaction',
        Payment: 'transaction',
        Invoice: 'transaction',
        Account: 'account',
        Vendor: 'vendor',
        Customer: 'customer',
        Attachable: 'attachment',
        // Plaid
        merchant: 'vendor',
      }[op.data.entityName] ?? op.data.entityName

    const mapped = applyMapper(mapper, op.data.entity, {
      remote_data_key: 'remote_data',
    })
    if ('lines' in mapped) {
      const txn = mapped as {
        amount?: number
        lines: {amount: number}[]
        id: string
      }
      const trialBalance = txn.lines?.reduce((acc, line) => {
        return acc + line.amount
      }, txn.amount ?? 0)
      if (trialBalance !== 0) {
        console.warn(`Transaction  does not balance: ${trialBalance} ${txn.id}`)
      }
    }

    return rxjs.of({
      ...op,
      data: {
        stream,
        data: {
          ...mapped,
          _openint_connection_id: ctx.source.id, // Should this be the default somehow?
          // Denormalize customer_id onto entities for now, though may be better
          // to just sync connection also?
          _openint_customer_id: ctx.source.customerId,
        },
        upsert: {
          key_columns: ['_openint_connection_id', 'id'],
          insert_only_columns: ['created_at'],
          no_diff_columns: ['updated_at'],
        },
      } satisfies RecordMessageBody,
    })
  })
}
