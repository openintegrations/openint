import type {ConnectorServer} from '@openint/cdk'
import type {openLedgerSchemas} from './def'

export const openLedgerServerConnector = {} satisfies ConnectorServer<
  typeof openLedgerSchemas
>

export default openLedgerServerConnector
