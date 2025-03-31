import type {ConnectorServer} from '@openint/cdk'
import type {mootaSchemas} from './def'

export const mootaServer = {
  // sourceSync removed
} satisfies ConnectorServer<typeof mootaSchemas>

export default mootaServer
