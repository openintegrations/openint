import {R} from '@openint/util/remeda'
import {generateOAuth2Server} from './auth-oauth2'
import {defConnectors} from './connectors.def'
import jsonDefs from './json-defs'

// TODO: Should no longer depend on jsonDefs
export const serverConnectors = R.mapValues(jsonDefs, (jsonDef, key) =>
  generateOAuth2Server(defConnectors[key], jsonDef.auth),
)
