import type {JsonConnectorDef} from '../schema'

export default {
  audience: ['business'],
  verticals: ['other'],
  display_name: 'Mural',
  stage: 'alpha',
  version: 1,
  auth: {
    type: 'OAUTH2',
    authorization_request_url:
      'https://app.mural.co/api/public/v1/authorization/oauth2',
    token_request_url:
      'https://app.mural.co/api/public/v1/authorization/oauth2/token',
    scope_separator: ' ',
    params_config: {
      authorize: {response_type: 'code'},
      token: {grant_type: 'authorization_code'},
    },
    openint_default_scopes: ['openid', 'offline_access'],
    openint_allowed_scopes: ['openid', 'offline_access', 'user:read', 'mural:read'],
    scopes: [
      {
        scope: 'openid',
        description:
          'Provides access to basic user profile information (like user ID) for authentication purposes',
      },
      {
        scope: 'offline_access',
        description:
          'Allows obtaining refresh tokens for long-term access when user is not actively using the application',
      },
      {
        scope: 'user:read',
        description: 'Read-only access to basic user profile information',
      },
      {
        scope: 'mural:read',
        description: 'Read-only access to murals and their content',
      },
      {
        scope: 'mural:write',
        description:
          'Create and modify murals, including adding/removing content',
      },
      {
        scope: 'workspace:admin',
        description:
          'Full administrative access to workspaces, including member management and settings',
      },
    ],
  },
} satisfies JsonConnectorDef
