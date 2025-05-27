import type {JsonConnectorDef} from '../schema'

export default {
  audience: ['business'],
  verticals: ['ticketing'],
  display_name: 'Asana',
  stage: 'alpha',
  version: 1,
  auth: {
    type: 'OAUTH2',
    authorization_request_url: 'https://app.asana.com/-/oauth_authorize',
    token_request_url: 'https://app.asana.com/-/oauth_token',
    scope_separator: ' ',
    params_config: {token: {grant_type: 'authorization_code'}},
    openint_default_scopes: ['openid', 'default'],
    openint_allowed_scopes: ['openid', 'default', 'tasks:read'],
    scopes: [
      {
        scope: 'openid',
        description:
          'Allows access to basic user information (name, email, etc.) using OpenID Connect. This is the minimal scope required for authentication.',
      },
      {
        scope: 'email',
        description:
          "Provides access to the user's email address. This is often used alongside 'openid' for authentication purposes.",
      },
      {
        scope: 'profile',
        description:
          "Provides access to the user's basic profile information (name, photo, etc.).",
      },
      {
        scope: 'default',
        description:
          "The default scope provides read-only access to the user's tasks, projects, and workspaces. It does not allow modifications.",
      },
      {
        scope: 'tasks:read',
        description: "Provides read-only access to the user's tasks.",
      },
      {
        scope: 'tasks:write',
        description: 'Allows creating, updating, and deleting tasks.',
      },
      {
        scope: 'projects:read',
        description: "Provides read-only access to the user's projects.",
      },
      {
        scope: 'projects:write',
        description: 'Allows creating, updating, and deleting projects.',
      },
      {
        scope: 'workspaces:read',
        description: "Provides read-only access to the user's workspaces.",
      },
      {
        scope: 'workspaces:write',
        description:
          'Allows modifying workspaces (e.g., adding/removing users).',
      },
    ],
  },
} satisfies JsonConnectorDef
