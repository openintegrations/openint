import type {ConnectorServer} from '@openint/cdk'
import type {leverSchemas} from './def'

export const leverServer = {
  // sourceSync removed
} satisfies ConnectorServer<typeof leverSchemas>

export default leverServer
