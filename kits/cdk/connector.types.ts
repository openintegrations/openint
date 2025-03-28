import type {Link as FetchLink} from '@opensdks/runtime'
import type {z} from '@opensdks/util-zod'
import type {
  ConnectionUpdateData,
  Destination,
  EntityPayload,
  Source,
  StateUpdateData,
  SyncOperation,
} from '@openint/sync'
import type {MaybePromise} from '@openint/util'
import {R} from '@openint/util'
import type {
  CheckConnectionContext,
  CheckConnectionOptions,
  ConnectContext,
  ConnectionUpdate,
  ConnectOptions,
  ConnectorMetadata,
  OpenDialogFn,
  WebhookReturnType,
  zPassthroughInput,
} from './connector-meta.types'
import type {CustomerId, Id} from './id.types'
import {makeId} from './id.types'
import type {ZStandard} from './models'
import type {VerticalKey} from './verticals'

/**
 * Equivalent to to airbyte's low code connector spec,
 *  plus the SPEC message in airbyte protocol spec
 */

export interface ConnectorSchemas {
  name: z.ZodLiteral<string>
  connectorConfig?: z.ZodTypeAny
  connectionSettings?: z.ZodTypeAny
  integrationData?: z.ZodTypeAny
  webhookInput?: z.ZodTypeAny
  preConnectInput?: z.ZodTypeAny
  connectInput?: z.ZodTypeAny
  /** aka postConnectInput... Should we rename? */
  connectOutput?: z.ZodTypeAny
  /** Maybe can be derived from webhookInput | postConnOutput | inlineInput? */

  // MARK: @deprecated. Use the etl vertical instead

  /** Will soon be deprecated @deprecated. Use the etl vertical instead */
  sourceState?: z.ZodTypeAny

  /** @deprecated. Use sourceOutputEntities */
  sourceOutputEntity?: z.ZodTypeAny
  /** Will soon be deprecated @deprecated. Use the etl vertical instead */
  sourceOutputEntities?: Record<string, z.ZodTypeAny>
  /** Will soon be deprecated @deprecated. Use the etl vertical instead */
  destinationState?: z.ZodTypeAny
  /** Will soon be deprecated @deprecated. Use the etl vertical instead */
  destinationInputEntity?: z.ZodTypeAny
}

export type AnyConnectorHelpers = ConnHelpers

export type EntityMapper<
  T extends {remote: unknown; settings: unknown} = {
    remote: unknown
    settings: unknown
  },
  TUnified = unknown,
> = (remote: T['remote'], settings: T['settings']) => TUnified

export type ConnHelpers<TSchemas extends ConnectorSchemas = ConnectorSchemas> =
  ReturnType<typeof connHelpers<TSchemas>>

export interface ConnectorDef<
  TSchemas extends ConnectorSchemas = ConnectorSchemas,
  T extends ConnHelpers<TSchemas> = ConnHelpers<TSchemas>,
> {
  name: TSchemas['name']['_def']['value']
  schemas: TSchemas
  metadata?: ConnectorMetadata

  standardMappers?: {
    integration?: (
      data: T['_types']['integrationData'],
    ) => Omit<ZStandard['integration'], 'id'>
    connection?: (
      settings: T['_types']['connectionSettings'],
    ) => Omit<ZStandard['connection'], 'id'>

    // TODO: Migrate to vertical format, as only verticals deal with mapping entities
    entity?:
      | Partial<{
          // Simpler
          [k in T['_types']['sourceOutputEntity']['entityName']]: (
            entity: Extract<T['_types']['sourceOutputEntity'], {entityName: k}>,
            settings: T['_types']['connectionSettings'],
          ) => EntityPayload | null
        }>
      // More powerful
      | ((
          entity: T['_types']['sourceOutputEntity'],
          settings: T['_types']['connectionSettings'],
        ) => EntityPayload | null)
  }

  streams?: {
    $defaults: {
      /** Only singular primary key supported for the moment */
      // TODO: Fix me up.
      primaryKey: string // PathsOf<T['_remoteEntity']>
      /** Used for incremental sync. Should only be string entities */
      cursorField?: string // PathsOf<T['_remoteEntity']>
    }
  }
}

export interface ConnectorClient<
  TDef extends ConnectorSchemas = ConnectorSchemas,
  T extends ConnHelpers<TDef> = ConnHelpers<TDef>,
> {
  useConnectHook?: (scope: {
    // userId: DeprecatedUserId | undefined
    openDialog: OpenDialogFn
  }) => (
    connectInput: T['_types']['connectInput'],
    context: ConnectOptions & {
      // TODO: Does this belong here?
      connectorConfigId: Id['ccfg']
    },
  ) => Promise<T['_types']['connectOutput']>
}

export interface ConnectorServer<
  TDef extends ConnectorSchemas = ConnectorSchemas,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TInstance = any,
  T extends ConnHelpers<TDef> = ConnHelpers<TDef>,
> {
  /**
   * Work around typescript not having contextual typing support for classes that implement interfaces
   * We recommend against using classes (which might be more convenient) due to the lack
   * of contextual typing for interfaces. @see https://github.com/microsoft/TypeScript/issues/1373
   */
  newInstance?: (opts: {
    config: T['_types']['connectorConfig']
    settings: T['_types']['connectionSettings']
    fetchLinks: FetchLink[]
    /** @deprecated, use fetchLinks instead for things like token refreshes or connection status update */
    onSettingsChange: (
      newSettings: T['_types']['connectionSettings'],
    ) => MaybePromise<void>
  }) => TInstance

  // MARK: - Connect

  preConnect?: (
    config: T['_types']['connectorConfig'],
    context: ConnectContext<T['_types']['connectionSettings']>,
    // TODO: Turn this into an object instead
    input: T['_types']['preConnectInput'],
  ) => Promise<T['_types']['connectInput']>

  postConnect?: (
    connectOutput: T['_types']['connectOutput'],
    config: T['_types']['connectorConfig'],
    context: ConnectContext<T['_types']['connectionSettings']>,
  ) => MaybePromise<
    Omit<
      ConnectionUpdate<
        T['_types']['sourceOutputEntity'],
        T['_types']['connectionSettings']
      >,
      'customerId'
    >
  >

  checkConnection?: (
    input: OmitNever<{
      settings: T['_types']['connectionSettings']
      config: T['_types']['connectorConfig']
      options: CheckConnectionOptions
      context: CheckConnectionContext
      instance?: TInstance
    }>,
  ) => MaybePromise<
    Omit<
      ConnectionUpdate<
        T['_types']['sourceOutputEntity'],
        T['_types']['connectionSettings']
      >,
      'customerId'
    >
  >

  // This probably need to also return an observable
  revokeConnection?: (
    settings: T['_types']['connectionSettings'],
    config: T['_types']['connectorConfig'],
    instance: TInstance,
  ) => Promise<unknown>

  // MARK: - Sync

  // pagination params
  listIntegrations?: (params: unknown) => Promise<{
    has_next_page: boolean
    next_cursor: string | null
    // Institution

    items: Array<{
      id: string
      name: string
      logo_url?: string | null
      updated_at: string
      verticals?: VerticalKey[]
      raw_data: T['_intOpType']['data']
    }>
  }>

  refreshConnection?: (
    settings: T['_types']['connectionSettings'],
    config: T['_types']['connectorConfig'],
  ) => Promise<T['_types']['connectionSettings']>

  /** @deprecated */
  sourceSync?: (
    input: OmitNever<{
      instance: TInstance
      customer: {id: CustomerId} | null | undefined
      /* Enabled streams */
      streams: {
        [k in T['_streamName']]?:
          | boolean
          | null
          | {disabled?: boolean; fields?: string[]}
      }
      state: T['_types']['sourceState']
      /** @deprecated, use `instance` instead */
      config: T['_types']['connectorConfig']
      /** @deprecated, use `instance` instead */
      settings: T['_types']['connectionSettings']
    }>,
  ) => Source<T['_types']['sourceOutputEntity']>

  /** @deprecated */
  destinationSync?: (
    input: OmitNever<{
      /** Needed for namespacing when syncing multiple source into same destination */
      source: {id: Id['conn']; connectorName: string} | undefined
      customer: {id: CustomerId; orgId: string} | null | undefined
      config: T['_types']['connectorConfig']
      settings: T['_types']['connectionSettings']
      state: T['_types']['destinationState']
    }>,
  ) => Destination<T['_types']['destinationInputEntity']>

  /** @deprecated */
  metaSync?: (
    input: OmitNever<{
      config: T['_types']['connectorConfig']
      // options: T['_types']['sourceState']
    }>,
  ) => Source<T['_intOpType']['data']>

  // MARK - Webhook
  // Need to add a input schema for each provider to verify the shape of the received
  // webhook requests...

  /** @deprecated */
  handleWebhook?: (
    webhookInput: T['_types']['webhookInput'],
    config: T['_types']['connectorConfig'],
  ) => MaybePromise<
    WebhookReturnType<
      T['_types']['sourceOutputEntity'],
      T['_types']['connectionSettings']
    >
  >

  /** Passthrough request proxy */
  /** @deprecated */
  proxy?: (instance: TInstance, req: Request) => Promise<Response>

  /** @deprecated */
  passthrough?: (
    instance: TInstance,
    input: z.infer<typeof zPassthroughInput>,
  ) => unknown
}

export interface ConnectorImpl<TSchemas extends ConnectorSchemas>
  extends ConnectorDef<TSchemas>,
    ConnectorServer<TSchemas>,
    ConnectorClient<TSchemas> {
  // helpers: IntHelpers<TSchemas>
}

export type AnyConnectorImpl = ConnectorImpl<ConnectorSchemas>

// MARK: - Runtime helpers

/** TODO: Helpers should receive the whole Def as input so we can do the re-mapping at the source layer */

export function connHelpers<TSchemas extends ConnectorSchemas>(
  schemas: TSchemas,
) {
  type _types = {
    [k in keyof TSchemas as k extends 'verticals' | 'sourceOutputEntities'
      ? never
      : k]: _infer<TSchemas[k]>
  }
  type _streams = {
    [k in keyof TSchemas['sourceOutputEntities']]: _infer<
      TSchemas['sourceOutputEntities'][k]
    >
  }
  type _streamName = keyof _streams

  type IntOpData = Extract<
    SyncOperation<{
      id: string
      entityName: 'integration'
      entity: _types['integrationData']
    }>,
    {type: 'data'}
  >
  type connUpdate = ConnectionUpdateData<
    _types['connectionSettings'],
    _types['integrationData']
  >
  type stateUpdate = StateUpdateData<
    _types['sourceState'],
    _types['destinationState']
  >
  type Src = Source<_types['sourceOutputEntity'], connUpdate, stateUpdate>

  type Op = SyncOperation<_types['sourceOutputEntity'], connUpdate, stateUpdate>
  type InputOp = SyncOperation<
    _types['destinationInputEntity'],
    connUpdate,
    stateUpdate
  >

  type OpData = Extract<Op, {type: 'data'}>
  type OpRes = Extract<Op, {type: 'connUpdate'}>
  type OpState = Extract<Op, {type: 'stateUpdate'}>
  type _connectionUpdateType = ConnectionUpdate<
    _types['sourceOutputEntity'],
    _types['connectionSettings']
  >
  type _webhookReturnType = WebhookReturnType<
    _types['sourceOutputEntity'],
    _types['connectionSettings']
  >
  return {
    ...schemas,
    _types: {} as _types,
    _streams: {} as _streams,
    _streamName: {} as _streamName,
    _resUpdateType: {} as connUpdate,
    _stateUpdateType: {} as stateUpdate,
    _opType: {} as Op,
    _intOpType: {} as IntOpData,
    _sourceType: {} as Src,
    _inputOpType: {} as InputOp,
    _connectionUpdateType: {} as _connectionUpdateType,
    _webhookReturnType: {} as _webhookReturnType,

    // Fns
    _type: <K extends keyof _types>(_k: K, v: _types[K]) => v,
    _op: <K extends Op['type']>(
      ...args: {} extends Omit<Extract<Op, {type: K}>, 'type'>
        ? [K]
        : [K, Omit<Extract<Op, {type: K}>, 'type'>]
    ) => ({...args[1], type: args[0]}) as unknown as Extract<Op, {type: K}>,
    _opRes: (id: string, rest: Omit<OpRes, 'id' | 'type'>) =>
      R.identity<Op>({
        // We don't prefix in `_opData`, should we actually prefix here?
        ...rest,
        // TODO: ok so this is a sign that we should be prefixing using a link of some kind...
        id: makeId('conn', schemas.name.value, id),
        type: 'connUpdate',
      }) as OpRes,
    _opState: (
      sourceState?: OpState['sourceState'],
      destinationState?: OpState['destinationState'],
    ) =>
      R.identity<Op>({
        sourceState,
        destinationState,
        type: 'stateUpdate',
      }) as OpState,
    _opData: <K extends OpData['data']['entityName']>(
      entityName: K,
      id: string,
      entity: string extends OpData['data']['entityName']
        ? Record<string, unknown> | null
        : Extract<OpData['data'], {entityName: K}>['entity'] | null,
    ) =>
      ({
        // TODO: Figure out why we need an `unknown` cast here
        data: {entityName, id, entity} as unknown as OpData['data'],
        type: 'data',
      }) satisfies OpData,
    _intOpData: (
      id: ExternalId,
      integrationData: _types['integrationData'],
    ): IntOpData => ({
      type: 'data',
      data: {
        // We don't prefix in `_opData`, should we actually prefix here?
        id: makeId('int', schemas.name.value, id),
        entityName: 'integration',
        entity: integrationData,
      },
    }),
    _webhookReturn: (
      connectionExternalId: _connectionUpdateType['connectionExternalId'],
      rest: Omit<_connectionUpdateType, 'connectionExternalId'>,
    ): _webhookReturnType => ({
      connectionUpdates: [{...rest, connectionExternalId}],
    }),
  }
}

// MARK: - Generic Helpers, perhaps move to separate file?

type _infer<T> = T extends z.ZodTypeAny ? z.infer<T> : never
type OmitNever<T> = Omit<T, NeverKeys<T>>
/** Surprisingly tricky, see. https://www.zhenghao.io/posts/ts-never */
type NeverKeys<T> = Exclude<
  {[K in keyof T]: [T[K]] extends [never] ? K : never}[keyof T],
  undefined
>
