/** Used for the side effect of window.MergeLink */
import type {ConnectorServer} from '@openint/cdk'
import type {brexSchemas} from './def'

export const brexServer = {
  // sourceSync removed
} satisfies ConnectorServer<typeof brexSchemas>

export default brexServer
