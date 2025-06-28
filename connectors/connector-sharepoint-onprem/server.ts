import type {ConnectorServer} from '@openint/cdk'
import type {sharepointOnPremSchema} from './def'

export const sharepointOnPremServer = {
} satisfies ConnectorServer<typeof sharepointOnPremSchema>

export default sharepointOnPremServer
