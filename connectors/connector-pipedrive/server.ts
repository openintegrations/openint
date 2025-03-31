import type {PipedriveSDK} from '@opensdks/sdk-pipedrive'
import type {ConnectorServer} from '@openint/cdk'
import type {pipedriveSchemas} from './def'

export const pipedriveServer = {} satisfies ConnectorServer<
  typeof pipedriveSchemas,
  PipedriveSDK
>

export default pipedriveServer
