import type {ConnectorServer} from '@openint/cdk'
import type {saltedgeSchemas} from './def'

export const saltedgeServer = {
  // sourceSync removed
} satisfies ConnectorServer<typeof saltedgeSchemas>

export default saltedgeServer
