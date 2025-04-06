import {R} from '@openint/util/remeda'
import {createOAuth2ConnectorDef} from './auth-oauth2/createOAuth2ConnectorDef'
import jsonDefs from './json-defs'

export const defConnectors = R.mapValues(jsonDefs, (jsonDef, name) =>
  createOAuth2ConnectorDef(name, jsonDef),
)
