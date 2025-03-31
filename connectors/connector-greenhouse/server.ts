import type {ConnectorServer} from '@openint/cdk'
import type {greenhouseSchema} from './def'

export const greenhouseServer = {
  // sourceSync removed
} satisfies ConnectorServer<typeof greenhouseSchema>

export default greenhouseServer
