import {R} from '@openint/util/remeda'
import {generateOAuth2ConnectorServer} from './auth-oauth2'
import {defConnectors} from './connectors.def'
import jsonDefs from './json-defs'

// TODO: Should no longer depend on jsonDefs
export const serverConnectors = R.mapValues(jsonDefs, (jsonDef, key) =>
  generateOAuth2ConnectorServer(defConnectors[key], jsonDef.auth),
)
