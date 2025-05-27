import type {JsonConnectorDef} from '../schema'

export default {
  audience: ['business'],
  verticals: ['other'],
  display_name: 'Envoy',
  stage: 'alpha',
  version: 1,
  auth: {
    type: 'OAUTH2',
    authorization_request_url: 'https://app.envoy.com/a/auth/v0/authorize',
    token_request_url: 'https://app.envoy.com/a/auth/v0/token',
    scope_separator: ' ',
    params_config: {
      authorize: {response_type: 'code'},
      token: {grant_type: 'authorization_code'},
    },
    openint_default_scopes: ['openid'],
    openint_allowed_scopes: ['openid', 'envoy.visitors.read'],
    scopes: [
      {
        scope: 'openid',
        description:
          'Provides access to authenticate the user and retrieve basic profile information (subject identifier)',
      },
      {
        scope: 'profile',
        description:
          'Provides access to basic user profile information (name, picture, etc.)',
      },
      {
        scope: 'email',
        description: "Provides access to the user's email address",
      },
      {
        scope: 'envoy.visitors.read',
        description: 'Read-only access to visitor information',
      },
      {
        scope: 'envoy.visitors.write',
        description: 'Read and write access to visitor information',
      },
      {
        scope: 'envoy.workplace.manage',
        description: 'Full access to workplace management features',
      },
    ],
  },
} satisfies JsonConnectorDef
