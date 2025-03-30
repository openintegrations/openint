import type {ConnectorServer} from '@openint/cdk'
import type {firebaseSchemas} from './def'

export const firebaseServer = {
  // sourceSync removed
} satisfies ConnectorServer<typeof firebaseSchemas>

export default firebaseServer
