/* eslint-disable @typescript-eslint/require-await */
import type {MetaService, MetaTable} from './metaService'

const noopTable: MetaTable<string, never> = {
  get: async () => undefined,
  list: async () => [],
  set: async () => {},
  delete: async () => {},
}

// Consider adding a memory metaService as well
// much like used to have memoryKV store
export const noopMetaService: MetaService = {
  tables: {
    connection: noopTable,
    integration: noopTable,
    connector_config: noopTable,
    pipeline: noopTable,
  },
  searchCustomers: async () => [],
  searchIntegrations: async () => [],
  findPipelines: async () => [],
  listConnectorConfigInfos: async () => [],
  findConnectionsMissingDefaultPipeline: async () => [],
  isHealthy: () => Promise.resolve({healthy: true}),
}
