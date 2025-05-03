import type {ConnectorServer} from '@openint/cdk'
import type {openLedgerSchemas} from './def'

export const openLedgerServerConnector = {
  // eslint-disable-next-line @typescript-eslint/require-await
  preConnect: async () => ({entity_id: 'cm9xa02q800071496d425jvux'}),
} satisfies ConnectorServer<typeof openLedgerSchemas>

export default openLedgerServerConnector
