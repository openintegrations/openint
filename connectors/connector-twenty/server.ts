import type {ConnectorServer} from '@openint/cdk'
import type {twentySchemas} from './def'

export const twentyServer = {
  // sourceSync removed
} satisfies ConnectorServer<typeof twentySchemas>

export default twentyServer
