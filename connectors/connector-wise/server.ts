import type {ConnectorServer} from '@openint/cdk'
import type {wiseSchemas} from './def'

export const wiseServer = {
  postConnect: ({connectOutput}) => ({
    connectionExternalId: connectOutput.apiToken ?? '',
    settings: {
      envName: connectOutput.envName ?? '',
      apiToken: connectOutput.apiToken,
    },
  }),
} satisfies ConnectorServer<typeof wiseSchemas>

export default wiseServer
