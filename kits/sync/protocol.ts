import type {rxjs} from '@openint/util/observable-utils'
import type {
  NoInfer,
  NonDiscriminatedUnion,
  ObjectPartialDeep,
} from '@openint/util/type-utils'
import type {Z} from '@openint/util/zod-utils'

import {z} from '@openint/util/zod-utils'
import {ZStandard} from '../cdk'

type ExternalId = string | number
interface Id {
  conn: string
}

/**
 * This will be standardized over time into either
 * [Airbyte protocol](https://docs.airbyte.com/understanding-airbyte/airbyte-protocol/)
 * or the [Singer spec](https://hub.meltano.com/singer/spec) [Orig spec](https://github.com/singer-io/getting-started/blob/master/docs/SPEC.md#singer-specification)
 *
 */

/**
 * TODO: We should add a `change` type here, as `null` could also be a valid value
 * Actually, in the simplest form we should just have a [id, data] without even
 * any entity name. This can get transformed to [id, entityName, changeType, entity] as needed.
 * // TODO: Conform this with airbyte protocol would be nice, and possibly adding in the custom postgres stuff?
 */
export interface AnyEntityPayload {
  // typename: string
  /** Rename to stream */
  entityName: string
  entity: unknown
  id: ExternalId
}

export interface ConnectionUpdateData<
  TSettings = {},
  TInsData = {},
  TVariant extends 'partial' | 'complete' = 'partial',
> {
  id: Id['conn']
  // TODO: remove `?` when Variant = 'complete'
  settings?: TVariant extends 'partial'
    ? ObjectPartialDeep<NoInfer<TSettings>> | undefined
    : TSettings
  integration?: {
    externalId: ExternalId
    data: TInsData
  }
  status?: ZStandard['connection']['status']
  status_message?: string
}
export interface StateUpdateData<TSrcOptions = {}, TDestOptions = {}> {
  sourceState?: ObjectPartialDeep<NoInfer<TSrcOptions>>
  destinationState?: ObjectPartialDeep<NoInfer<TDestOptions>>
}

type NullableEntity<T> = T extends AnyEntityPayload
  ? {[k in keyof T]: k extends 'entity' ? T[k] | null : T[k]}
  : T

export type SyncOperation<
  TData = any,
  TConnUpdate extends object = ConnectionUpdateData,
  TStateUpdate extends object = StateUpdateData,
> =
  | (TConnUpdate & {type: 'connUpdate'})
  // TODO: We should separate state from options, and perhaps make state
  // less black box also, see airbyte protocol v2 for inspiration
  // Also consider merging fields below into a single field
  | (TStateUpdate & {type: 'stateUpdate'; subtype?: 'init' | 'complete'})
  | {type: 'data'; data: NullableEntity<TData>} // Rename entityName to `stream` and lift to top level?
  | {type: 'commit'} // Should this be a separate type of StateUpdate
  | {type: 'ready'} // Should this be a separate type of StateUpdate

export type AnySyncOperation = NonDiscriminatedUnion<SyncOperation>

export type Source<
  T,
  TConnUpdate extends object = ConnectionUpdateData,
  TStateUpdate extends object = StateUpdateData,
> = rxjs.Observable<SyncOperation<T, TConnUpdate, TStateUpdate>>

/**
 * Adapted from TRPC link and Apollo Link
 * A specialized version of rxjs.OperatorFucntion. Often times stateful.
 */
export type Link<
  TDataIn = any,
  TDataOut = TDataIn,
  TConnUpdate extends object = ConnectionUpdateData,
  TStateUpdate extends object = StateUpdateData,
> = (
  obs: rxjs.Observable<SyncOperation<TDataIn, TConnUpdate, TStateUpdate>>,
) => rxjs.Observable<SyncOperation<TDataOut, TConnUpdate, TStateUpdate>>

export type LinkFactory<
  TDataIn = any,
  TDataOut = TDataIn,
  TConnUpdate extends object = ConnectionUpdateData,
  TStateUpdate extends object = StateUpdateData,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TArg = any,
> = (arg: TArg) => Link<TDataIn, TDataOut, TConnUpdate, TStateUpdate>

/**
 * Terminating link is just a link... It can still emit things like ready event
 * for the engine to listen to. The resulting event may not be the same as the input events
 */
export type Destination<
  T = any,
  TConnUpdate extends object = ConnectionUpdateData,
  TStateUpdate extends object = StateUpdateData,
> = Link<T, T, TConnUpdate, TStateUpdate>

// @deprecated?

export type EntityPayload<TEntity = Record<string, unknown>> = Omit<
  Z.infer<typeof zEntityPayload>,
  'entity'
> & {entity: TEntity}

export const zEntityPayload = z.object({
  /** TODO: Rename this to `stream` */
  entityName: z.string(),
  id: z.string(),
  entity: z.record(z.unknown()),
})

/**
 * This doesn't fully address the `discriminatedUnion` case...
 * So do we still want to use it? Sometimes entitySchema resolves to unknown too.
 */
export function entityPayload<EntityType extends Z.AnyZodObject>(
  entitySchema: EntityType,
) {
  return z.object({
    entityName: z.string(),
    id: z.string(),
    entitySchema,
  })
}

export type EntityPayloadWithRaw = Z.infer<typeof zEntityPayloadWithRaw>
export const zEntityPayloadWithRaw = zEntityPayload.extend({
  raw: z.unknown(),
  connectorName: z.string(),
  connection_id: z.string().optional(),
})

export type StdSyncOperation<
  TEntity extends Record<string, unknown> = Record<string, unknown>,
> = SyncOperation<EntityPayload<TEntity>>
