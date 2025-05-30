import type {JsonConnectorDef} from './schema'

import {R} from '@openint/util/remeda'
import {createAPIKeyConnectorServer} from './auth-apikey/createApiKeyConnectorServer'
import {createOAuth2ConnectorServer} from './auth-oauth2'
import {defConnectors} from './connectors.def'
import jsonDefs from './json-defs'

const getServerFnByAuthType = (authType: JsonConnectorDef['auth']['type']) => {
  switch (authType) {
    case 'OAUTH2':
      return createOAuth2ConnectorServer
    case 'API_KEY':
      return createAPIKeyConnectorServer
    default:
      return createOAuth2ConnectorServer
  }
}

// TODO: Should no longer depend on jsonDefs
// Fix types
export const serverConnectors = R.mapValues(jsonDefs, (jsonDef, key) =>
  getServerFnByAuthType(jsonDef.auth.type)(
    defConnectors[key] as any,
    jsonDef.auth,
  ),
)
