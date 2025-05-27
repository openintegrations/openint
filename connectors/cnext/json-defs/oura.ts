import type {JsonConnectorDef} from '../schema'

export default {
  audience: ['business'],
  verticals: ['other'],
  display_name: 'Oura',
  stage: 'alpha',
  version: 1,
  auth: {
    type: 'OAUTH2',
    authorization_request_url: 'https://cloud.ouraring.com/oauth/authorize',
    token_request_url: 'https://api.ouraring.com/oauth/token',
    scope_separator: ' ',
    params_config: {
      authorize: {response_type: 'code'},
      token: {grant_type: 'authorization_code'},
    },
    openint_default_scopes: ['email'],
    openint_allowed_scopes: ['email', 'daily', 'workout'],
    scopes: [
      {
        scope: 'email',
        description:
          "Access to the user's email address (used for identification)",
      },
      {
        scope: 'personal',
        description:
          'Read basic personal information (name, age, gender, etc.)',
      },
      {
        scope: 'daily',
        description:
          'Read daily summary data (activity, readiness, sleep scores)',
      },
      {
        scope: 'heartrate',
        description:
          'Read heart rate data (including detailed HR measurements)',
      },
      {
        scope: 'session',
        description: 'Read workout session data (exercise, tags, duration)',
      },
      {
        scope: 'tag',
        description: 'Read and write tags (user-generated annotations)',
      },
      {
        scope: 'workout',
        description: 'Read workout data (exercise sessions and details)',
      },
    ],
  },
} satisfies JsonConnectorDef
