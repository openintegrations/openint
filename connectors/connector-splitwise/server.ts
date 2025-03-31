import type {ConnectorServer} from '@openint/cdk'
import type {splitwiseSchemas} from './def'

export const splitwiseServer = {
  // sourceSync removed
} satisfies ConnectorServer<typeof splitwiseSchemas>

export default splitwiseServer
