import type {CustomerId, Id, IDS} from '@openint/cdk/id.types'
import type {ZRaw} from '@openint/cdk/models'
import type {NoInfer, ObjectPartialDeep} from '@openint/util'

export interface MetaTable<
  TID extends string = string,
  T extends Record<string, unknown> = Record<string, unknown>,
> {
  get(id: TID): Promise<T | undefined | null>
  list(options: {
    ids?: TID[]
    /** Maybe remove this? not applicable everywhere */
    customerId?: CustomerId | null
    /** Maybe remove this? not applicable everywhere */
    connectorConfigId?: Id['ccfg'] | null
    /** Maybe remove this? not applicable everywhere */
    connectorName?: string | null
    where?: Record<string, string>
    /** Used for search */
    keywords?: string | null
    /** Used for limiting results to only events after a certain time */
    since?: number
    /** Pagination, not necessarily supported */
    limit?: number
    offset?: number
    /** Used for ordering results */
    orderBy?: string
    order?: string
  }): Promise<readonly T[]>
  set(id: TID, data: Omit<T, 'id'>): Promise<void>
  patch?(id: TID, partial: ObjectPartialDeep<NoInfer<T>>): Promise<void>
  delete(id: TID): Promise<void>
}

export interface CustomerResultRow {
  id: CustomerId
  connectionCount?: number
  firstCreatedAt?: unknown
  lastUpdatedAt?: unknown
}
/** TODO: Rename to DB Adapter */
export interface MetaService {
  tables: {
    [k in keyof ZRaw]: MetaTable<Id[(typeof IDS)[k]], ZRaw[k]>
  }
  // TODO: Make the following methods optional
  // and default to dumb listing all rows from table and in memory filter
  // if the corresponding methods are not implemented
  // This is useful for things like memory
  searchCustomers: (options: {
    keywords?: string | null
    limit?: number
    offset?: number
  }) => Promise<readonly CustomerResultRow[]>
  searchIntegrations: (options: {
    /** Leave empty to list the top integrations */
    keywords?: string | null
    /** is there a stronger type here than string? */
    connectorNames?: string[]
    limit?: number
    offset?: number
  }) => Promise<ReadonlyArray<ZRaw['integration']>>
  /** TODO: Implement limit & offset */
  findPipelines: (options: {
    connectionIds?: Array<Id['conn']>
    secondsSinceLastSync?: number
    includeDisabled?: boolean
  }) => Promise<ReadonlyArray<ZRaw['pipeline']>>
  /** Id is used to check RLS policy right now for customer */
  listConnectorConfigInfos: (opts?: {
    id?: Id['ccfg'] | null
    connectorName?: string | null
  }) => Promise<
    ReadonlyArray<{
      id: Id['ccfg']
      envName?: string | null
      displayName?: string | null
      integrations?: Record<string, {enabled: boolean}>
    }>
  >
  /** Missing default pipeline */
  findConnectionsMissingDefaultPipeline: () => Promise<
    ReadonlyArray<{id: Id['conn']}>
  >
  isHealthy: (checkDefaultPostgresConnections?: boolean) => Promise<{
    healthy: boolean
    error?: string
  }>
}
