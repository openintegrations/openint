/** Used for the side effect of window.MergeLink */

import type {ConnectorServer} from '@openint/cdk'
import type {mergeSchemas} from './def'

export const mergeServer = {
  // sourceSync removed
} satisfies ConnectorServer<typeof mergeSchemas>

export default mergeServer
