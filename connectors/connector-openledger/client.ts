import type {ConnectorClient} from '@openint/cdk'
import type {openLedgerSchemas} from './def'

export const openLedgerClientConnector = {
  useConnectHook: (_) => {
    return async (opts, {integrationExternalId}) => {
      console.log('[openledger] Will connect', opts, integrationExternalId)
      return {entity_id: '123'}
    }
  },
} satisfies ConnectorClient<typeof openLedgerSchemas>

export default openLedgerClientConnector
