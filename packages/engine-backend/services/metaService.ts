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
    customer_id?: CustomerId | null
    /** Maybe remove this? not applicable everywhere */
    connector_config_id?: Id['ccfg'] | null
    /** Maybe remove this? not applicable everywhere */
    connector_name?: string | null
    where?: Record<string, string>
    /** Used for search */
    keywords?: string | null
    /** Used for limiting results to only events after a certain time */
    since?: number
    /** Pagination, not necessarily supported */
    limit?: number
    offset?: number
    /** Used for ordering results */
    order_by?: string
    order?: string
  }): Promise<readonly T[]>
  set(id: TID, data: Omit<T, 'id'>): Promise<void>
  patch?(id: TID, partial: ObjectPartialDeep<NoInfer<T>>): Promise<void>
  delete(id: TID): Promise<void>
}

export interface CustomerResultRow {
  id: CustomerId
  connection_count?: number
  first_created_at?: unknown
  last_updated_at?: unknown
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
    connector_names?: string[]
    limit?: number
    offset?: number
  }) => Promise<ReadonlyArray<ZRaw['integration']>>
  /** TODO: Implement limit & offset */
  findPipelines: (options: {
    connection_ids?: Array<Id['conn']>
    seconds_since_last_sync?: number
    include_disabled?: boolean
  }) => Promise<ReadonlyArray<ZRaw['pipeline']>>
  /** Id is used to check RLS policy right now for customer */
  listConnectorConfigInfos: (opts?: {
    id?: Id['ccfg'] | null
    connector_name?: string | null
  }) => Promise<
    ReadonlyArray<{
      id: Id['ccfg']
      env_name?: string | null
      display_name?: string | null
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
