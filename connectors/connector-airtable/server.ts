import type {ConnectorServer} from '@openint/cdk'
import type {airtableSchemas} from './def'

export const airtableServer = {} satisfies ConnectorServer<
  typeof airtableSchemas
>

export default airtableServer
