import type {JsonConnectorDef} from '../schema'

export default {
  audience: ['business'],
  verticals: ['communication'],
  display_name: 'Dialpad',
  stage: 'alpha',
  version: 1,
  auth: {
    type: 'OAUTH2',
    authorization_request_url: 'https://dialpad.com/oauth2/authorize',
    token_request_url: 'https://dialpad.com/oauth2/token',
    scope_separator: ' ',
    params_config: {
      authorize: {response_type: 'code'},
      token: {grant_type: 'authorization_code'},
    },
    openint_default_scopes: ['openid'],
    openint_allowed_scopes: ['openid', 'user_presence:read', 'calls:read'],
    scopes: [
      {
        scope: 'openid',
        description:
          'Provides access to authenticate the user and retrieve basic user profile information',
      },
      {
        scope: 'email',
        description: "Access to the user's email address",
      },
      {
        scope: 'profile',
        description:
          'Basic access to user profile information (name, picture, etc.)',
      },
      {
        scope: 'calls:read',
        description: 'Read access to call history and recordings',
      },
      {
        scope: 'calls:write',
        description: 'Ability to make and manage calls',
      },
      {
        scope: 'contacts:read',
        description: "Read access to user's contacts",
      },
      {
        scope: 'admin:read',
        description: 'Read access to organization admin features',
      },
      {
        scope: 'admin:write',
        description: 'Full access to organization admin features',
      },
      {
        scope: 'user_presence:read',
        description: 'Read access to user presence/availability status',
      },
    ],
  },
} satisfies JsonConnectorDef
