import type {JsonConnectorDef} from '../schema'

export default {
  audience: ['business'],
  verticals: ['social-media'],
  display_name: 'Strava (Mobile)',
  stage: 'alpha',
  version: 1,
  auth: {
    type: 'OAUTH2',
    authorization_request_url: 'https://www.strava.com/oauth/mobile/authorize',
    token_request_url: 'https://www.strava.com/api/v3/oauth/token',
    scope_separator: ',',
    params_config: {
      authorize: {response_type: 'code', approval_prompt: 'auto'},
      token: {grant_type: 'authorization_code'},
    },
    openint_default_scopes: ['read'],
    openint_allowed_scopes: ['read', 'activity:read'],
    scopes: [
      {
        scope: 'read',
        description:
          'Read public segments, public routes, public profile data, public posts, public events, club feeds, and leaderboards',
      },
      {
        scope: 'read_all',
        description:
          'Read private routes, private segments, and private activities for the user',
      },
      {
        scope: 'profile:read_all',
        description:
          'Read all profile information even if the user has set their profile visibility to private',
      },
      {
        scope: 'profile:write',
        description:
          "Update the user's weight and Functional Threshold Power (FTP), and access to star or unstar segments",
      },
      {
        scope: 'activity:read',
        description:
          "Read the user's activity data for activities that are visible to Everyone and Followers",
      },
      {
        scope: 'activity:read_all',
        description:
          "Read the user's activity data for all activities, including private activities",
      },
      {
        scope: 'activity:write',
        description:
          'Create activities, upload activity data, update title and type, and delete activities',
      },
    ],
  },
} satisfies JsonConnectorDef
