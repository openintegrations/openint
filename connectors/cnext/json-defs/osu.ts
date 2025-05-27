import type {JsonConnectorDef} from '../schema'

export default {
  audience: ['business'],
  verticals: ['other'],
  display_name: 'Osu',
  stage: 'alpha',
  version: 1,
  auth: {
    type: 'OAUTH2',
    authorization_request_url: 'https://osu.ppy.sh/oauth/authorize',
    token_request_url: 'https://osu.ppy.sh/oauth/token',
    scope_separator: ' ',
    params_config: {
      authorize: {response_type: 'code'},
      token: {grant_type: 'authorization_code'},
    },
    openint_default_scopes: ['identify'],
    openint_allowed_scopes: ['identify'],
    scopes: [
      {
        scope: 'identify',
        description:
          "Allows access to the user's basic profile information, including their user ID, username, avatar, and other public details. This scope is essential for identifying the user within the osu! ecosystem.",
      },
    ],
  },
} satisfies JsonConnectorDef
