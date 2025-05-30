import type {JsonConnectorDef} from '../schema'

export default {
  audience: ['business'],
  verticals: ['social-media'],
  display_name: 'Twitter',
  stage: 'ga',
  version: 1,
  auth: {
    type: 'OAUTH2',
    authorization_request_url: 'https://twitter.com/i/oauth2/authorize',
    token_request_url: 'https://api.twitter.com/2/oauth2/token',
    scope_separator: ' ',
    params_config: {
      authorize: {response_type: 'code', response_mode: 'query'},
      token: {grant_type: 'authorization_code'},
    },
    openint_default_scopes: ['offline.access'],
    openint_allowed_scopes: ['offline.access'],
    scopes: [
      {
        scope: 'offline.access',
        description:
          "Allows the application to obtain a refresh token that can be used to request new access tokens without user interaction. This is useful for maintaining long-term access to a user's resources when they are not actively using the application.",
      },
    ],
  },
} satisfies JsonConnectorDef
