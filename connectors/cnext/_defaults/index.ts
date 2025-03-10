import type {ConnectorSchemas, ConnectorServer} from '../../../kits/cdk'
import type {JsonConnectorDef} from '../def'
import {generateOAuth2Server} from './oauth2'

export function generateConnectorServer<T extends ConnectorSchemas>(
  connectorDef: JsonConnectorDef,
): ConnectorServer<T> {
  switch (connectorDef.auth_type) {
    case 'OAUTH2':
      return generateOAuth2Server(connectorDef)
    default:
      throw new Error(`Unsupported auth type: ${connectorDef.auth_type}`)
  }
}
