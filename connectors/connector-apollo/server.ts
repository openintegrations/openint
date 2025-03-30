import type {ConnectorServer} from '@openint/cdk'
import type {apolloSchemas} from './def'

export const apolloServer = {
  // sourceSync removed
} satisfies ConnectorServer<typeof apolloSchemas>

export default apolloServer
