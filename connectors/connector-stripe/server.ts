import type {ConnectorServer} from '@openint/cdk'
import type {stripeSchemas} from './def'

export const stripeServer = {
  // sourceSync removed
} satisfies ConnectorServer<typeof stripeSchemas>

export default stripeServer
