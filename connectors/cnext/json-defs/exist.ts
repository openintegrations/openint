import type {JsonConnectorDef} from '../schema'

export default {
  audience: ['business'],
  verticals: ['other'],
  display_name: 'Exist',
  stage: 'alpha',
  version: 1,
  auth: {
    type: 'OAUTH2',
    authorization_request_url: 'https://exist.io/oauth2/authorize',
    token_request_url: 'https://exist.io/oauth2/access_token',
    scope_separator: ' ',
    params_config: {
      authorize: {response_type: 'code'},
      token: {grant_type: 'authorization_code'},
    },
    openint_default_scopes: ['openid', 'offline_access'],
    openint_allowed_scopes: ['openid', 'offline_access', 'user:id', 'api:read'],
    scopes: [
      {
        scope: 'openid',
        description:
          'Provides access to authenticate the user and retrieve basic profile information (like user ID). This is the minimal scope required for authentication flows.',
      },
      {
        scope: 'profile',
        description:
          'Provides access to basic profile information (name, picture, gender, etc.). This builds upon openid scope.',
      },
      {
        scope: 'email',
        description:
          "Provides access to the user's email address and verification status.",
      },
      {
        scope: 'offline_access',
        description:
          'Allows the application to request refresh tokens for long-lived access.',
      },
      {
        scope: 'api:read',
        description:
          'Read-only access to API resources. This has a smaller surface area than write access.',
      },
      {
        scope: 'api:write',
        description: 'Read and write access to API resources.',
      },
      {
        scope: 'user:id',
        description:
          "Provides access only to the user's unique identifier. This has the smallest surface area of all scopes.",
      },
    ],
  },
} satisfies JsonConnectorDef
