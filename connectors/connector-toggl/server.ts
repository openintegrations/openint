import type {ConnectorServer} from '@openint/cdk'
import type {togglSchemas} from './def'

export const togglServer = {
  // sourceSync removed
} satisfies ConnectorServer<typeof togglSchemas>

export default togglServer
