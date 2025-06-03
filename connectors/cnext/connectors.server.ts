import type {ConnectorDef} from '@openint/cdk'
import type {Z} from '@openint/util/zod-utils'
import type {apiKeySchemas} from './auth-apikey/schemas'
import type {oauth2Schemas} from './auth-oauth2'

import {R} from '@openint/util/remeda'
import {createAPIKeyConnectorServer} from './auth-apikey/createApiKeyConnectorServer'
import {createOAuth2ConnectorServer} from './auth-oauth2'
import {defConnectors} from './connectors.def'
import jsonDefs from './json-defs'

// TODO: Should no longer depend on jsonDefs
// Fix types
export const serverConnectors = R.mapValues(jsonDefs, (jsonDef, key) => {
  if (jsonDef.auth.type === 'API_KEY') {
    return createAPIKeyConnectorServer(
      defConnectors[key] as ConnectorDef<
        typeof apiKeySchemas & {name: Z.ZodLiteral<typeof key>}
      >,
    )
  } else if (jsonDef.auth.type === 'OAUTH2') {
    return createOAuth2ConnectorServer(
      defConnectors[key] as ConnectorDef<
        typeof oauth2Schemas & {name: Z.ZodLiteral<typeof key>}
      >,
      jsonDef.auth,
    )
  } else {
    throw new Error(`Unsupported auth type: ${jsonDef.auth}`)
  }
})
