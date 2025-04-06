import type {JsonConnectorDef} from '../schema'

export default {
  audience: ['consumer'],
  verticals: ['social-media'],
  display_name: 'Dummy OAuth2',
  stage: 'ga',
  version: 1,
  auth: {
    type: 'OAUTH2',
    // TODO: Get these from the connector config
    authorization_request_url:
      'http://localhost:4000/api/dummy-oauth2/authorize',
    token_request_url: 'http://localhost:4000/api/dummy-oauth2/token',
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
