import type {ConnectorServer} from '@openint/cdk'
import type {onebrickSchemas} from './def'

export const onebrickServer = {
  // sourceSync removed
} satisfies ConnectorServer<typeof onebrickSchemas>

export default onebrickServer
