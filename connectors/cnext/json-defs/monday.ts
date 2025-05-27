import type {JsonConnectorDef} from '../schema'

export default {
  audience: ['business'],
  verticals: ['ticketing'],
  display_name: 'Monday',
  stage: 'alpha',
  version: 1,
  auth: {
    type: 'OAUTH2',
    authorization_request_url: 'https://auth.monday.com/oauth2/authorize',
    token_request_url: 'https://auth.monday.com/oauth2/token',
    scope_separator: ' ',
    params_config: {},
    openint_default_scopes: ['openid', 'offline_access'],
    openint_allowed_scopes: ['openid', 'offline_access', 'me:read', 'boards:read'],
    scopes: [
      {
        scope: 'me:read',
        description:
          "Allows read-only access to the authenticated user's profile information, including user ID, name, and email.",
      },
      {
        scope: 'boards:read',
        description:
          'Allows read-only access to boards and their basic metadata, but not the items within them.',
      },
      {
        scope: 'boards:write',
        description:
          'Allows creating, updating, and deleting boards, as well as modifying board settings.',
      },
      {
        scope: 'workspaces:read',
        description:
          'Allows read-only access to workspaces and their basic metadata.',
      },
      {
        scope: 'updates:read',
        description:
          'Allows read-only access to updates (comments) on items across boards.',
      },
      {
        scope: 'updates:write',
        description:
          'Allows creating and updating comments on items across boards.',
      },
      {
        scope: 'openid',
        description:
          'Required for OpenID Connect flows to authenticate users and get basic profile information.',
      },
      {
        scope: 'offline_access',
        description:
          'Allows the application to obtain refresh tokens for long-term access when the user is not actively using the application.',
      },
    ],
  },
} satisfies JsonConnectorDef
