import type {ConnectorServer} from '@openint/cdk'
import type {salesforceSchemas} from './def'

export const salesforceServer = {
  // sourceSync removed
} satisfies ConnectorServer<typeof salesforceSchemas>

export default salesforceServer
