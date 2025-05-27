import type {JsonConnectorDef} from '../schema'

export default {
  audience: ['business'],
  verticals: ['other'],
  display_name: 'Whoop',
  stage: 'alpha',
  version: 1,
  auth: {
    type: 'OAUTH2',
    authorization_request_url: 'https://api.prod.whoop.com/oauth/oauth2/auth',
    token_request_url: 'https://api.prod.whoop.com/oauth/oauth2/token',
    scope_separator: ' ',
    params_config: {authorize: {response_type: 'code'}},
    openint_default_scopes: ['offline'],
    openint_allowed_scopes: ['offline', 'read:profile'],
    scopes: [
      {
        scope: 'offline',
        description:
          'Allows the application to refresh access tokens to maintain access when the user is not actively using the app',
      },
      {
        scope: 'read:profile',
        description:
          'Read basic user profile information including user ID and name',
      },
      {
        scope: 'read:recovery',
        description:
          'Read recovery metrics including strain and sleep performance',
      },
      {
        scope: 'read:sleep',
        description:
          'Read sleep data including sleep stages, duration, and quality metrics',
      },
      {
        scope: 'read:workout',
        description:
          'Read workout data including exercise type, duration, and heart rate metrics',
      },
      {
        scope: 'read:body_measurement',
        description:
          'Read body measurement data including weight and heart rate variability',
      },
      {
        scope: 'write:workout',
        description: 'Create and update workout data',
      },
    ],
  },
} satisfies JsonConnectorDef
