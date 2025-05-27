import type {JsonConnectorDef} from '../schema'

export default {
  audience: ['business'],
  verticals: ['streaming', 'communication'],
  display_name: 'Grain (OAuth)',
  stage: 'alpha',
  version: 1,
  auth: {
    type: 'OAUTH2',
    authorization_request_url:
      'https://grain.com/_/public-api/oauth2/authorize',
    token_request_url: 'https://api.grain.com/_/public-api/oauth2/token',
    scope_separator: ' ',
    params_config: {
      authorize: {response_type: 'code'},
      token: {grant_type: 'authorization_code'},
    },
    openint_default_scopes: ['openid', 'offline_access'],
    openint_allowed_scopes: ['openid', 'offline_access', 'user:read', 'meetings:read'],
    scopes: [
      {
        scope: 'openid',
        description:
          'Authenticate users and retrieve basic profile information (user ID)',
      },
      {
        scope: 'offline_access',
        description: 'Request refresh tokens for long-lived access',
      },
      {
        scope: 'user:read',
        description: 'Read basic user profile information',
      },
      {
        scope: 'meetings:read',
        description: 'Read meeting metadata and recordings',
      },
      {
        scope: 'meetings:write',
        description: 'Create and manage meetings',
      },
      {
        scope: 'recordings:read',
        description: 'Access meeting recordings',
      },
      {
        scope: 'admin',
        description: 'Full administrative access to all organization resources',
      },
    ],
  },
} satisfies JsonConnectorDef
