import type {ConnectorServer} from '@openint/cdk'
import type {rampSchemas} from './def'

export const rampServer = {
  // sourceSync removed
} satisfies ConnectorServer<typeof rampSchemas>

export default rampServer
