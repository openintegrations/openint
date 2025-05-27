import type {JsonConnectorDef} from '../schema'

export default {
  audience: ['business'],
  verticals: ['other'],
  display_name: 'Timely',
  stage: 'alpha',
  version: 1,
  auth: {
    type: 'OAUTH2',
    authorization_request_url: 'https://api.timelyapp.com/1.1/oauth/authorize',
    token_request_url: 'https://api.timelyapp.com/1.1/oauth/token',
    scope_separator: ' ',
    params_config: {
      authorize: {response_type: 'code'},
      token: {grant_type: 'authorization_code'},
    },
    openint_default_scopes: ['openid', 'offline_access'],
    openint_allowed_scopes: ['openid', 'offline_access', 'profile:read', 'time_entries:read'],
    scopes: [
      {
        scope: 'openid',
        description:
          'Authenticate the user and retrieve basic profile information (like user ID)',
      },
      {
        scope: 'profile:read',
        description: 'Read basic user profile information (name, email, etc.)',
      },
      {
        scope: 'time_entries:read',
        description: 'Read time entries and reports',
      },
      {
        scope: 'time_entries:write',
        description: 'Create and modify time entries',
      },
      {
        scope: 'projects:read',
        description: 'Read project information',
      },
      {
        scope: 'projects:write',
        description: 'Create and modify projects',
      },
      {
        scope: 'account:read',
        description: 'Read account-level information',
      },
      {
        scope: 'offline_access',
        description: 'Refresh tokens for long-lived access',
      },
    ],
  },
} satisfies JsonConnectorDef
