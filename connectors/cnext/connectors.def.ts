import {R} from '@openint/util/remeda'
import {generateOauthConnectorDef} from './auth-oauth2/schema'
import jsonDefs from './defs'

export const defConnectors = R.mapValues(jsonDefs, generateOauthConnectorDef)
