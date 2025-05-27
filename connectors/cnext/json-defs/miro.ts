import type {JsonConnectorDef} from '../schema'

export default {
  audience: ['business'],
  verticals: ['other'],
  display_name: 'Miro',
  stage: 'alpha',
  version: 1,
  auth: {
    type: 'OAUTH2',
    authorization_request_url: 'https://miro.com/oauth/authorize',
    token_request_url: 'https://api.miro.com/v1/oauth/token',
    scope_separator: ' ',
    params_config: {
      authorize: {response_type: 'code'},
      token: {grant_type: 'authorization_code'},
    },
    openint_default_scopes: ['offline_access'],
    openint_allowed_scopes: ['offline_access', 'identity:read', 'boards:read'],
    scopes: [
      {
        scope: 'identity:read',
        description:
          'Allows read-only access to basic user identity information (user ID, name, email, etc.)',
      },
      {
        scope: 'offline_access',
        description:
          'Allows the application to obtain refresh tokens for long-term access when user is not actively using the app',
      },
      {
        scope: 'boards:read',
        description: 'Allows read-only access to boards and their content',
      },
      {
        scope: 'boards:write',
        description: 'Allows creating and modifying boards and their content',
      },
      {
        scope: 'team:read',
        description: 'Allows read-only access to team information and members',
      },
      {
        scope: 'team:write',
        description: 'Allows modifying team information and managing members',
      },
    ],
  },
} satisfies JsonConnectorDef
