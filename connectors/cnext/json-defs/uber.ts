import type {JsonConnectorDef} from '../schema'

export default {
  audience: ['business'],
  verticals: ['other'],
  display_name: 'Uber',
  stage: 'alpha',
  version: 1,
  auth: {
    type: 'OAUTH2',
    authorization_request_url: 'https://login.uber.com/oauth/v2/authorize',
    token_request_url: 'https://login.uber.com/oauth/v2/token',
    scope_separator: ' ',
    params_config: {
      authorize: {response_type: 'code'},
      token: {grant_type: 'authorization_code'},
    },
    openint_default_scopes: ['offline_access'],
    openint_allowed_scopes: ['offline_access', 'profile', 'history_lite'],
    scopes: [
      {
        scope: 'profile',
        description:
          'Access to basic user profile information including name, email, and profile picture.',
      },
      {
        scope: 'history',
        description:
          "Access to user's trip history including time, distance, and route information for completed trips.",
      },
      {
        scope: 'history_lite',
        description:
          "Limited access to user's trip history (only time and distance, no route details).",
      },
      {
        scope: 'places',
        description: "Access to user's saved places in the Uber app.",
      },
      {
        scope: 'request',
        description: 'Ability to make ride requests on behalf of the user.',
      },
      {
        scope: 'request_receipt',
        description: 'Access to receipt information for requested rides.',
      },
      {
        scope: 'all_trips',
        description:
          'Comprehensive access to all user trip data including ongoing and completed trips.',
      },
      {
        scope: 'offline_access',
        description:
          "Allows the application to access the API on the user's behalf when they're not actively using the application.",
      },
    ],
  },
} satisfies JsonConnectorDef
