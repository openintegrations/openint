import type {JsonConnectorDef} from '../schema'

export default {
  audience: ['business'],
  verticals: ['ticketing'],
  display_name: 'Front',
  stage: 'alpha',
  version: 1,
  auth: {
    type: 'OAUTH2',
    authorization_request_url: 'https://app.frontapp.com/oauth/authorize',
    token_request_url: 'https://app.frontapp.com/oauth/token',
    scope_separator: ' ',
    params_config: {},
    openint_default_scopes: ['openid'],
    openint_allowed_scopes: ['openid', 'read:user', 'read:data'],
    scopes: [
      {
        scope: 'openid',
        description:
          'Allows access to authenticate the user and request basic profile information using OpenID Connect.',
      },
      {
        scope: 'profile',
        description:
          'Provides access to basic user profile information (name, picture, gender, etc.).',
      },
      {
        scope: 'email',
        description: "Provides access to the user's email address.",
      },
      {
        scope: 'read:user',
        description: 'Read-only access to user profile information.',
      },
      {
        scope: 'write:user',
        description: 'Read and write access to user profile information.',
      },
      {
        scope: 'read:data',
        description: 'Read-only access to user data.',
      },
      {
        scope: 'write:data',
        description: 'Read and write access to user data.',
      },
      {
        scope: 'admin:data',
        description: 'Full administrative access to all user data.',
      },
    ],
  },
} satisfies JsonConnectorDef
