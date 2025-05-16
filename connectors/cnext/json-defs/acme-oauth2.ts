import type {JsonConnectorDef} from '../schema'

export default {
  audience: ['consumer'],
  verticals: ['social-media'],
  display_name: 'Acme OAuth',
  stage: 'ga',
  version: 1,
  auth: {
    type: 'OAUTH2',
    code_challenge_method: 'S256',
    authorization_request_url: '{{baseURLs.api}}/acme-oauth2/authorize',
    token_request_url: '{{baseURLs.api}}/acme-oauth2/token',
    introspection_request_url: '{{baseURLs.api}}/acme-oauth2/token/introspect',
    revocation_request_url: '{{baseURLs.api}}/acme-oauth2/token/revoke',
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
