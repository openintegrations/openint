import type {ConnectorServer} from '@openint/cdk'
import type {lunchmoneySchemas} from './def'

export const lunchmoneyServer = {
  // sourceSync removed
} satisfies ConnectorServer<typeof lunchmoneySchemas>

export default lunchmoneyServer
