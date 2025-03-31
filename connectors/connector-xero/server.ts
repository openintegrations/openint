import type {ConnectorServer} from '@openint/cdk'
import {type xeroSchemas} from './def'

export const xeroServer = {} satisfies ConnectorServer<typeof xeroSchemas>

export default xeroServer
