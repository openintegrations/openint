import type {ConnectorServer} from '@openint/cdk'
import type {plaidSchemas} from './def'

export const plaidServer = {
  // sourceSync removed
} satisfies ConnectorServer<typeof plaidSchemas>

export default plaidServer
