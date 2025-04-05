import {generateOauthConnectorDef} from '../_defaults/oauth2/schema'
import type {JsonConnectorDef} from '../def'

export const jsonDef = {
  audience: ['consumer'],
  connector_name: 'dummy-oauth2', // This should be determined by the filename for consistency
  verticals: ['social-media'],
  display_name: 'Dummy OAuth2',
  stage: 'ga',
  version: 1,
  auth: {
    type: 'OAUTH2',
    authorization_request_url: 'http://localhost:3000/oauth/authorize',
    token_request_url: 'http://localhost:3000/oauth/token',
    scope_separator: ' ',
    params_config: {},
    openint_scopes: ['read:profile'],
    scopes: [
      {
        scope: 'read:profile',
        description: 'Read profile information',
      },
      {
        scope: 'write:posts',
        description: 'Read posts',
      },
    ],
  },
} satisfies JsonConnectorDef

export const def = generateOauthConnectorDef(jsonDef)
