import type {ConnectorServer} from '@openint/cdk'
import type {hubspotSchemas} from './def'

export const hubspotServer = {
  // sourceSync removed
} satisfies ConnectorServer<typeof hubspotSchemas>

export default hubspotServer
