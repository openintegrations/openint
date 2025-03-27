import {generateOAuth2Server} from '../_defaults'
import {generateOauthConnectorDef} from '../_defaults/oauth2/schema'
import type {JsonConnectorDef} from '../def'

const jsonDef = {
  audience: ['business'],
  connector_name: 'googlesheet',
  verticals: ['other'],
  display_name: 'Google Sheet',
  stage: 'ga',
  version: 1,
  auth: {
    type: 'OAUTH2',
    authorization_request_url: 'https://accounts.google.com/o/oauth2/v2/auth',
    token_request_url: 'https://oauth2.googleapis.com/token',
    scope_separator: ' ',
    params_config: {
      authorize: {
        response_type: 'code',
        access_type: 'offline',
        prompt: 'consent',
      },
    },
    openint_scopes: [],
    scopes: [],
  },
} satisfies JsonConnectorDef

export const def = generateOauthConnectorDef(jsonDef)

export const server = generateOAuth2Server(def, jsonDef.auth)
