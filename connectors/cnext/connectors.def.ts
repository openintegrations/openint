import {R} from '@openint/util/remeda'
import {generateOauthConnectorDef} from './auth-oauth2/schema'
import jsonDefs from './json-defs'

export const defConnectors = R.mapValues(jsonDefs, (jsonDef, name) =>
  generateOauthConnectorDef(name, jsonDef),
)
