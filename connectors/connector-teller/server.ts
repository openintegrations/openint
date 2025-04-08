import type {ConnectorServer} from '@openint/cdk'
import type {tellerSchemas} from './def'

export const tellerServer = {
  // sourceSync removed
} satisfies ConnectorServer<typeof tellerSchemas>

export default tellerServer
