import type {JsonConnectorDef} from '../schema'

export default {
  audience: ['business'],
  verticals: ['other'],
  display_name: 'LinkHut',
  stage: 'alpha',
  version: 1,
  auth: {
    type: 'OAUTH2',
    authorization_request_url: 'https://ln.ht/_/oauth/authorize',
    token_request_url: 'https://api.ln.ht/v1/oauth/token',
    scope_separator: ' ',
    params_config: {},
    openint_default_scopes: ['openid', 'offline_access'],
    openint_allowed_scopes: ['openid', 'offline_access', 'links:read'],
    scopes: [
      {
        scope: 'openid',
        description:
          'Authenticate the user and retrieve basic profile information (user ID)',
      },
      {
        scope: 'profile',
        description:
          "Access to user's basic profile information (name, avatar, etc.)",
      },
      {
        scope: 'links:read',
        description: "Read access to user's saved links/bookmarks",
      },
      {
        scope: 'links:write',
        description: "Create, update, and delete user's saved links/bookmarks",
      },
      {
        scope: 'tags:read',
        description: "Read access to user's link tags/categories",
      },
      {
        scope: 'tags:write',
        description: "Create, update, and delete user's link tags/categories",
      },
      {
        scope: 'offline_access',
        description:
          'Request a refresh token for long-term access when user is not active',
      },
    ],
  },
} satisfies JsonConnectorDef
