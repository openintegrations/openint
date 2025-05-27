import type {JsonConnectorDef} from '../schema'

export default {
  audience: ['business'],
  verticals: ['social-media', 'communication'],
  display_name: 'Tumblr',
  stage: 'alpha',
  version: 1,
  auth: {
    type: 'OAUTH2',
    authorization_request_url: 'https://www.tumblr.com/oauth2/authorize',
    token_request_url: 'https://api.tumblr.com/v2/oauth2/token',
    scope_separator: ' ',
    params_config: {
      authorize: {response_type: 'code'},
      token: {grant_type: 'authorization_code'},
    },
    openint_default_scopes: ['basic', 'offline_access'],
    openint_allowed_scopes: ['basic', 'offline_access', 'profile'],
    scopes: [
      {
        scope: 'basic',
        description:
          'Allows read access to basic user information (e.g., username, dashboard, likes). This is the minimal scope required for most authorization flows.',
      },
      {
        scope: 'write',
        description:
          'Allows creating, updating, and deleting posts, as well as reblogging and liking posts.',
      },
      {
        scope: 'read',
        description:
          "Allows read access to the user's posts, drafts, and private messages.",
      },
      {
        scope: 'offline_access',
        description:
          "Allows the application to access the user's data while the user is not logged in (via refresh tokens).",
      },
      {
        scope: 'profile',
        description:
          "Allows read access to the user's profile information (e.g., avatar, bio, and blog settings).",
      },
    ],
  },
} satisfies JsonConnectorDef
