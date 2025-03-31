import type {ConnectorServer} from '@openint/cdk'
import type {foreceiptSchemas} from './def'

export const foreceiptServer = {
  // sourceSync removed
} satisfies ConnectorServer<typeof foreceiptSchemas>

export default foreceiptServer
