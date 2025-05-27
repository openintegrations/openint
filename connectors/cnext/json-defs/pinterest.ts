import type {JsonConnectorDef} from '../schema'

export default {
  audience: ['business'],
  verticals: ['social-media', 'streaming'],
  display_name: 'Pinterest',
  stage: 'alpha',
  version: 1,
  auth: {
    type: 'OAUTH2',
    authorization_request_url: 'https://www.pinterest.com/oauth',
    token_request_url: 'https://api.pinterest.com/v5/oauth/token',
    scope_separator: ' ',
    params_config: {
      authorize: {response_type: 'code'},
      token: {grant_type: 'authorization_code'},
    },
    openint_default_scopes: ['openid'],
    openint_allowed_scopes: ['openid', 'user_accounts:read', 'pins:read', 'boards:read', 'ads:read'],
    scopes: [
      {
        scope: 'user_accounts:read',
        description:
          'Read access to basic user account information (profile data, but not private details)',
      },
      {
        scope: 'pins:read',
        description: 'Read access to view pins (public pins only)',
      },
      {
        scope: 'pins:write',
        description: 'Create, update, and delete pins',
      },
      {
        scope: 'boards:read',
        description: 'Read access to view boards and their basic information',
      },
      {
        scope: 'boards:write',
        description: 'Create, update, and delete boards',
      },
      {
        scope: 'ads:read',
        description: 'Read access to ad accounts and campaigns',
      },
      {
        scope: 'ads:write',
        description: 'Create and manage ad campaigns',
      },
      {
        scope: 'openid',
        description:
          'Required for OIDC compliance, provides user identity verification',
      },
    ],
  },
} satisfies JsonConnectorDef
