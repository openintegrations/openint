import type {JsonConnectorDef} from '../schema'

export default {
  audience: ['business'],
  verticals: ['ticketing'],
  display_name: 'ClickUp',
  stage: 'alpha',
  version: 1,
  auth: {
    type: 'OAUTH2',
    authorization_request_url: 'https://app.clickup.com/api',
    token_request_url: 'https://api.clickup.com/api/v2/oauth/token',
    scope_separator: ' ',
    params_config: {},
    openint_default_scopes: ['openid'],
    openint_allowed_scopes: ['openid', 'read:task'],
    scopes: [
      {
        scope: 'openid',
        description:
          'Allows access to basic user profile information (user ID) for authentication purposes.',
      },
      {
        scope: 'email',
        description: "Provides access to the user's email address.",
      },
      {
        scope: 'profile',
        description:
          'Provides access to basic profile information (name, avatar, etc.).',
      },
      {
        scope: 'read:task',
        description: 'Allows read-only access to tasks in authorized spaces.',
      },
      {
        scope: 'write:task',
        description:
          'Allows creating and modifying tasks in authorized spaces.',
      },
      {
        scope: 'read:team',
        description:
          'Allows read-only access to team information and member lists.',
      },
      {
        scope: 'write:team',
        description: 'Allows modifying team settings and managing members.',
      },
      {
        scope: 'admin:space',
        description:
          'Provides full administrative access to spaces, including deletion rights.',
      },
    ],
  },
} satisfies JsonConnectorDef
