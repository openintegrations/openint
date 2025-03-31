import type {ConnectorServer} from '@openint/cdk'
import type {heronSchemas} from './def'

export const heronServer = {
  // sourceSync removed
} satisfies ConnectorServer<typeof heronSchemas>

export default heronServer
