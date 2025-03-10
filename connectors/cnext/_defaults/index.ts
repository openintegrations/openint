import type {ConnectorSchemas, ConnectorServer} from '../../../kits/cdk'
import type {JsonConnectorDef} from '../def'
import {OAuth2ServerOverrides} from './oauth2/def'
import {generateOAuth2Server} from './oauth2/server'

// Create a conditional type that selects the appropriate overrides based on auth type
export type AuthTypeOverrides<T extends JsonConnectorDef> =
  T['auth']['type'] extends 'OAUTH2'
    ? OAuth2ServerOverrides
    : // Add other auth types here as needed
      never

export type ServerOverrides<
  T extends ConnectorSchemas,
  D extends JsonConnectorDef,
> = Partial<ConnectorServer<T>> & Partial<AuthTypeOverrides<D>>

export function generateConnectorServer<
  T extends ConnectorSchemas,
  D extends JsonConnectorDef,
>(params: {def: D; overrides?: ServerOverrides<T, D>}): ConnectorServer<T> {
  const {def, overrides} = params

  switch (def.auth.type) {
    case 'OAUTH2': {
      return generateOAuth2Server(def, overrides)
    }

    default:
      throw new Error(`Unsupported auth type: ${def.auth.type}`)
  }
}
