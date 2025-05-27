import type {JsonConnectorDef} from '../schema'

export default {
  audience: ['business'],
  verticals: ['other'],
  display_name: 'Coros',
  stage: 'alpha',
  version: 1,
  auth: {
    type: 'OAUTH2',
    authorization_request_url: 'https://open.coros.com/oauth2/authorize',
    token_request_url: 'https://open.coros.com/oauth2/accesstoken',
    scope_separator: ' ',
    params_config: {
      authorize: {response_type: 'code'},
      token: {grant_type: 'authorization_code'},
    },
    openint_default_scopes: ['offline_access'],
    openint_allowed_scopes: ['offline_access', 'profile:read', 'activity:read', 'device:read'],
    scopes: [
      {
        scope: 'profile:read',
        description:
          'Read basic user profile information (name, email, profile picture)',
      },
      {
        scope: 'activity:read',
        description: 'Read user activity data (workouts, sessions, exercises)',
      },
      {
        scope: 'activity:write',
        description: 'Create and update activity data',
      },
      {
        scope: 'offline_access',
        description:
          'Refresh tokens for long-term access when user is not actively using the app',
      },
      {
        scope: 'device:read',
        description: 'Read connected device information and settings',
      },
      {
        scope: 'device:write',
        description: 'Write device settings and configurations',
      },
    ],
  },
} satisfies JsonConnectorDef
