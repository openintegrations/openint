import type {ConnectorSchemas, ConnectorServer} from '../../../kits/cdk'
import type {ConnectorDef} from '../def'
import {generateOAuth2Server} from './oauth2'

export function generateConnectorServerV1<T extends ConnectorSchemas>(
  connectorDef: ConnectorDef,
): ConnectorServer<T> {
  switch (connectorDef.auth_type) {
    case 'OAUTH2':
      return generateOAuth2Server(connectorDef)
    default:
      throw new Error(`Unsupported auth type: ${connectorDef.auth_type}`)
  }
}
