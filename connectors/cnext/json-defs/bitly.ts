import type {JsonConnectorDef} from '../schema'

export default {
  audience: ['business'],
  verticals: ['social-media'],
  display_name: 'Bitly',
  stage: 'alpha',
  version: 1,
  auth: {
    type: 'OAUTH2',
    authorization_request_url: 'https://bitly.com/oauth/authorize',
    token_request_url: 'https://api-ssl.bitly.com/oauth/access_token',
    scope_separator: ' ',
    params_config: {
      authorize: {response_type: 'code'},
      token: {grant_type: 'authorization_code'},
    },
    openint_default_scopes: ['openid', 'bitly:links:read'],
    openint_allowed_scopes: ['openid', 'profile', 'bitly:links:read'],
    scopes: [
      {
        scope: 'openid',
        description:
          'Provides access to authenticate the user and retrieve basic user profile information (like user ID). This is the minimal scope required for OAuth authorization flows.',
      },
      {
        scope: 'profile',
        description:
          'Provides access to basic user profile information including name, default group GUID, and login details.',
      },
      {
        scope: 'bitly:links:read',
        description:
          'Provides read-only access to link data including analytics and click counts.',
      },
      {
        scope: 'bitly:links:write',
        description:
          'Provides access to create, modify, and delete Bitly links.',
      },
      {
        scope: 'bitly:groups:read',
        description:
          'Provides read-only access to group information and metrics.',
      },
      {
        scope: 'bitly:groups:write',
        description:
          'Provides access to modify group settings and preferences.',
      },
      {
        scope: 'bitly:organization:read',
        description:
          'Provides read-only access to organization-level data and metrics.',
      },
      {
        scope: 'bitly:organization:write',
        description:
          'Provides access to modify organization settings and manage members.',
      },
    ],
  },
} satisfies JsonConnectorDef
