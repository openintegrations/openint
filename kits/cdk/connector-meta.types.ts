import type {NangoProvider} from '@opensdks/sdk-nango/src/nango.oas'
import {z} from '@opensdks/util-zod'
import type {oas30, oas31} from 'openapi3-ts'
import type {
  AnyEntityPayload,
  ConnectionUpdateData,
  Source,
} from '@openint/sync'
import {castIs} from '@openint/util'
import {AuthType, JsonConnectorDef} from '../../connectors/cnext'
import type {ConnHelpers} from './connector.types'
import type {CustomerId, ExtCustomerId, ExternalId, Id} from './id.types'
import {zExternalId, zId} from './id.types'
import type {VerticalKey} from './verticals'

export const zConnectorStage = z.enum(['hidden', 'alpha', 'beta', 'ga'])

export type OpenApiSpec = oas30.OpenAPIObject | oas31.OpenAPIObject

export interface ConnectorMetadata {
  // TODO: @pellicceama add audience and other fields from SimpleConnectorDef
  logoUrl?: string
  // TODO: @pellicceama remove this
  logoSvg?: string
  displayName?: string
  /** @deprecated way to indicate an integration outputs raw rather than standardized data */
  // TODO: @pellicceama remove this
  layer?: 'core' | 'ledger'
  // TODO: @pellicceama remove this
  platforms?: Array<'cloud' | 'local'>
  stage?: z.infer<typeof zConnectorStage>
  // labels?: Array<'featured' | 'banking' | 'accounting' | 'enrichment'>
  verticals?: VerticalKey[]

  /** Intended user types for this connector */
  audience?: Array<'consumer' | 'business'>

  /** External links related to the connector */
  links?: {
    webUrl?: string
    apiDocsUrl?: string
  }

  /** Version of the connector */
  version?: number

  openapiSpec?: {
    proxied?: OpenApiSpec
    original?: OpenApiSpec
  }

  /** Whether this is an oauth integration? */
  nangoProvider?: NangoProvider

  /* Native oauth type */
  authType?: AuthType

  /** The new json connector def for this connector */
  jsonDef?: JsonConnectorDef
}

// MARK: - Shared connect types

/** Useful for establishing the initial pipeline when creating a connection for the first time */

export type ConnectOptions = z.input<typeof zConnectOptions>
export const zConnectOptions = z.object({
  // userId: UserId,
  /** Noop if `connectionId` is specified */
  integrationExternalId: zExternalId.nullish(),
  connectionExternalId: zExternalId.nullish(),
})

export const zPostConnectOptions = zConnectOptions.extend({
  syncInBand: z.boolean().nullish(),
  integrationId: zId('int').nullish(),
})

// MARK: - Client side connect types

export type OpenDialogFn = (
  Component: React.ComponentType<{close: () => void}>,
  options?: {
    dismissOnClickOutside?: boolean
    onClose?: () => void
  },
) => void

export type UseConnectHook<T extends ConnHelpers = ConnHelpers> = (scope: {
  openDialog: OpenDialogFn
}) => (
  connectInput: T['_types']['connectInput'],
  context: ConnectOptions & {
    // TODO: Does this belong here?
    connectorConfigId: Id['ccfg']
  },
) => Promise<T['_types']['connectOutput']>

// MARK: - Server side connect types

export interface CheckConnectionContext {
  webhookBaseUrl: string
}

/** Context providers get during the connection establishing phase */
export interface ConnectContext<TSettings>
  extends Omit<ConnectOptions, 'connectionExternalId' | 'envName'>,
    CheckConnectionContext {
  extCustomerId: ExtCustomerId
  /** Used for OAuth based integrations, e.g. https://plaid.com/docs/link/oauth/#create-and-register-a-redirect-uri */
  redirectUrl?: string
  connection?: {
    externalId: ExternalId
    settings: TSettings
  } | null
}

// TODO: We should rename `provider` to `integration` given that they are both
// Sources AND destinations. Provider only makes sense for sources.
// An integration can have `connect[UI]`, `src[Connector]` and `dest[Connector]`
export type CheckConnectionOptions = z.infer<typeof zCheckConnectionOptions>
export const zCheckConnectionOptions = z.object({
  /**
   * Always make a request to the connector. Perhaps should be the default?
   * Will have to refactor `checkConnection` to be a bit different
   */
  skipCache: z.boolean().nullish(),
  /** Persist input into connection storage */
  import: z.boolean().nullish(),
  /**
   * Update the webhook associated with this connection to based on webhookBaseUrl
   */
  updateWebhook: z.boolean().nullish(),
  /** Fire webhook for default data updates  */
  sandboxSimulateUpdate: z.boolean().nullish(),
  /** For testing out disconnection handling */
  sandboxSimulateDisconnect: z.boolean().nullish(),
})

/** Extra props not on ResoUpdateData */
export interface ConnectionUpdate<
    TEntity = AnyEntityPayload,
    TSettings = unknown,
  >
  // make `ResoUpdateData.id` not prefixed so we can have better inheritance
  extends Omit<ConnectionUpdateData<TSettings>, 'id'> {
  // Subset of connUpdate
  connectionExternalId: ExternalId
  // Can we inherit types used by metaLinks?
  /** If missing it means do not change the userId... */
  customerId?: CustomerId | null

  source$?: Source<TEntity>
  triggerDefaultSync?: boolean
}

export type WebhookInput = z.infer<typeof zWebhookInput>
export const zWebhookInput = z.object({
  headers: z
    .record(z.unknown())
    .refine(castIs<import('http').IncomingHttpHeaders>()),
  query: z.record(z.unknown()),
  body: z.unknown(),
})

export interface WebhookReturnType<TEntity, TSettings> {
  connectionUpdates: Array<ConnectionUpdate<TEntity, TSettings>>
  /** HTTP Response body */
  response?: {
    body: Record<string, unknown>
  }
}

export const zPassthroughInput = z.object({
  method: z.enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']),
  path: z.string(),
  query: z.record(z.unknown()).optional(),
  headers: z.record(z.unknown()).optional(),
  body: z.record(z.unknown()).optional(),
})
export type PassthroughInput = z.infer<typeof zPassthroughInput>
