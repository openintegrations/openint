import type {ConnectorServer} from '@openint/cdk'
import {type postgresSchemas} from './def'

export const postgresServer = {
  // sourceSync and destinationSync removed
} satisfies ConnectorServer<typeof postgresSchemas>

export default postgresServer
