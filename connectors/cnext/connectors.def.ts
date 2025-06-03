import type {JsonConnectorDef} from './schema'

import {R} from '@openint/util/remeda'
import {createApiKeyConnectorDef} from './auth-apikey/createApiKeyConnectorDef'
import {createOAuth2ConnectorDef} from './auth-oauth2/createOAuth2ConnectorDef'
import jsonDefs from './json-defs'

const getConnectorDefFnByAuthMode = (
  authType: JsonConnectorDef['auth']['type'],
) => {
  switch (authType) {
    case 'OAUTH2':
      return createOAuth2ConnectorDef
    case 'API_KEY':
      return createApiKeyConnectorDef
    default:
      throw new Error('Unsupported connector auth type')
  }
}

export const defConnectors = R.mapValues(jsonDefs, (jsonDef, name) =>
  getConnectorDefFnByAuthMode(jsonDef.auth.type)(name, jsonDef),
)
