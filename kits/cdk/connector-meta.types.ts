import type {oas30, oas31} from 'openapi3-ts'
import type {
  AnyEntityPayload,
  ConnectionUpdateData,
  Source,
} from '@openint/sync'
import type {Z} from '@openint/util/zod-utils'
// TODO: Fix this cyclic import hack
// eslint-disable-next-line import-x/no-relative-packages
import type {AuthType, JsonConnectorDef} from '../../connectors/cnext/schema'
import type {ConnHelpers} from './connector.types'
import type {CustomerId, ExtCustomerId, ExternalId, Id} from './id.types'
import type {VerticalKey} from './verticals'

import {castIs, z} from '@openint/util/zod-utils'
import {zExternalId, zId} from './id.types'

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
  stage?: Z.infer<typeof zConnectorStage>
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

  /* Native oauth type */
  authType?: AuthType

  /** The new json connector def for this connector */
  jsonDef?: JsonConnectorDef
}

// MARK: - Shared connect types

/** Useful for establishing the initial pipeline when creating a connection for the first time */

export type ConnectOptions = Z.input<typeof zConnectOptions>
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
  connectInput: T['_types']['connect_input'],
  context: ConnectOptions & {
    // TODO: Does this belong here?
    connectorConfigId: Id['ccfg']
  },
) => Promise<T['_types']['connect_output']>

// MARK: - Server side connect types

export interface CheckConnectionContext {
  webhookBaseUrl: string
  baseURLs: {
    api: string
    console: string
    connect: string
  }
  fetch?: (req: Request) => Promise<Response>
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
  baseURLs: {
    api: string
    console: string
    connect: string
  }
  /** Custom fetch, typically for testing purposes */
  fetch?: (req: Request) => Promise<Response>
}

// TODO: We should rename `provider` to `integration` given that they are both
// Sources AND destinations. Provider only makes sense for sources.
// An integration can have `connect[UI]`, `src[Connector]` and `dest[Connector]`
export type CheckConnectionOptions = Z.infer<typeof zCheckConnectionOptions>
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
  connectionExternalId?: ExternalId
  // Can we inherit types used by metaLinks?
  /** If missing it means do not change the userId... */
  customerId?: CustomerId | null

  source$?: Source<TEntity>
  triggerDefaultSync?: boolean
}

export type WebhookInput = Z.infer<typeof zWebhookInput>
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
