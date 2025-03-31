import type {ConnectorServer} from '@openint/cdk'
import type {wiseSchemas} from './def'

export const wiseServer = {
  postConnect: (input) => ({
    connectionExternalId: input.apiToken ?? '',
    settings: {
      envName: input.envName ?? '',
      apiToken: input.apiToken,
    },
  }),
} satisfies ConnectorServer<typeof wiseSchemas>

export default wiseServer
