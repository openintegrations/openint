import type {Link as FetchLink} from '@opensdks/runtime'
import type {
  AnyEntityPayload,
  ConnectionUpdateData,
  SyncOperation,
} from '@openint/sync'
import {R} from '@openint/util/remeda'
import type {MaybePromise} from '@openint/util/type-utils'
import type {Z} from '@openint/util/zod-utils'
import type {
  CheckConnectionContext,
  CheckConnectionOptions,
  ConnectContext,
  ConnectionUpdate,
  ConnectOptions,
  ConnectorMetadata,
  OpenDialogFn,
  WebhookReturnType,
} from './connector-meta.types'
import type {Id} from './id.types'
import {makeId} from './id.types'
import type {VerticalKey} from './verticals'
import type {ZStandard} from './zStandard'

/**
 * Equivalent to to airbyte's low code connector spec,
 *  plus the SPEC message in airbyte protocol spec
 */

export interface ConnectorSchemas {
  name: Z.ZodLiteral<string>
  connector_config?: Z.ZodTypeAny
  connection_settings?: Z.ZodTypeAny
  integration_data?: Z.ZodTypeAny
  webhook_input?: Z.ZodTypeAny
  pre_connect_input?: Z.ZodTypeAny
  connect_input?: Z.ZodTypeAny
  /** aka postConnectInput... Should we rename? */
  connect_output?: Z.ZodTypeAny
  /** Maybe can be derived from webhookInput | postConnOutput | inlineInput? */
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
      data: T['_types']['integration_data'],
    ) => Omit<ZStandard['integration'], 'id'>
    connection?: (
      settings: T['_types']['connection_settings'],
    ) => Omit<ZStandard['connection'], 'id'>
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
    connectInput: T['_types']['connect_input'],
    context: ConnectOptions & {
      // TODO: Does this belong here?
      connectorConfigId: Id['ccfg']
    },
  ) => Promise<T['_types']['connect_output']>
}

export interface ConnectorServer<
  TSchemas extends ConnectorSchemas = ConnectorSchemas,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TInstance = any,
  T extends ConnHelpers<TSchemas> = ConnHelpers<TSchemas>,
> {
  /**
   * Work around typescript not having contextual typing support for classes that implement interfaces
   * We recommend against using classes (which might be more convenient) due to the lack
   * of contextual typing for interfaces. @see https://github.com/microsoft/TypeScript/issues/1373
   */
  newInstance?: (opts: {
    config: T['_types']['connector_config']
    settings: T['_types']['connection_settings']
    fetchLinks: FetchLink[]
    /** @deprecated, use fetchLinks instead for things like token refreshes or connection status update */
    onSettingsChange: (
      newSettings: T['_types']['connection_settings'],
    ) => MaybePromise<void>
  }) => TInstance

  // MARK: - Connect

  preConnect?: (opts: {
    config: T['_types']['connector_config']
    context: ConnectContext<T['_types']['connection_settings']>
    input: T['_types']['pre_connect_input']
  }) => Promise<T['_types']['connect_input']>

  postConnect?: (opts: {
    connectOutput: T['_types']['connect_output']
    config: T['_types']['connector_config']
    context: ConnectContext<T['_types']['connection_settings']>
  }) => MaybePromise<
    Omit<
      ConnectionUpdate<AnyEntityPayload, T['_types']['connection_settings']>,
      'customerId'
    >
  >

  checkConnection?: (
    opts: OmitNever<{
      settings: T['_types']['connection_settings']
      config: T['_types']['connector_config']
      options: CheckConnectionOptions
      context: CheckConnectionContext
      instance?: TInstance
    }>,
  ) => MaybePromise<
    Omit<
      ConnectionUpdate<AnyEntityPayload, T['_types']['connection_settings']>,
      'customerId'
    >
  >

  // This probably need to also return an observable
  revokeConnection?: (opts: {
    settings: T['_types']['connection_settings']
    config: T['_types']['connector_config']
    instance: TInstance
  }) => Promise<unknown>

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

  refreshConnection?: (opts: {
    settings: T['_types']['connection_settings']
    config: T['_types']['connector_config']
  }) => Promise<T['_types']['connection_settings']>

  // MARK - Webhook
  // Need to add a input schema for each provider to verify the shape of the received
  // webhook requests...

  /** @deprecated */
  handleWebhook?: (opts: {
    webhookInput: T['_types']['webhook_input']
    config: T['_types']['connector_config']
  }) => MaybePromise<
    WebhookReturnType<AnyEntityPayload, T['_types']['connection_settings']>
  >

  /** Passthrough request proxy */
  /** @deprecated */
  proxy?: (opts: {instance: TInstance; req: Request}) => Promise<Response>
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
    [k in keyof TSchemas as k extends 'verticals' ? never : k]: _infer<
      TSchemas[k]
    >
  }

  type IntOpData = Extract<
    SyncOperation<{
      id: string
      entityName: 'integration'
      entity: _types['integration_data']
    }>,
    {type: 'data'}
  >
  type connUpdate = ConnectionUpdateData<
    _types['connection_settings'],
    _types['integration_data']
  >

  type Op = SyncOperation<any, connUpdate>

  type OpData = Extract<Op, {type: 'data'}>
  type OpRes = Extract<Op, {type: 'connUpdate'}>
  type OpState = Extract<Op, {type: 'stateUpdate'}>
  type _connectionUpdateType = ConnectionUpdate<
    any,
    _types['connection_settings']
  >
  type _webhookReturnType = WebhookReturnType<
    any,
    _types['connection_settings']
  >
  return {
    ...schemas,
    _types: {} as _types,
    _resUpdateType: {} as connUpdate,
    _opType: {} as Op,
    _intOpType: {} as IntOpData,
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
      R.identity()<Op>({
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
      R.identity()<Op>({
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
      integrationData: _types['integration_data'],
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

type _infer<T> = T extends Z.ZodTypeAny ? Z.infer<T> : never
type OmitNever<T> = Omit<T, NeverKeys<T>>
/** Surprisingly tricky, see. https://www.zhenghao.io/posts/ts-never */
type NeverKeys<T> = Exclude<
  {[K in keyof T]: [T[K]] extends [never] ? K : never}[keyof T],
  undefined
>
