import type {JsonConnectorDef} from '../schema'

export default {
  audience: ['business'],
  verticals: ['other'],
  display_name: 'Fitbit',
  stage: 'alpha',
  version: 1,
  auth: {
    type: 'OAUTH2',
    authorization_request_url: 'https://www.fitbit.com/oauth2/authorize',
    token_request_url: 'https://api.fitbit.com/oauth2/token',
    scope_separator: ' ',
    params_config: {},
    openint_default_scopes: ['profile'],
    openint_allowed_scopes: ['profile', 'activity'],
    scopes: [
      {
        scope: 'profile',
        description:
          "Read-only access to user's profile information including display name, date of birth, and other basic account details.",
      },
      {
        scope: 'activity',
        description:
          'Read-only access to activity data and exercise logs including daily activity summaries, activity logs, and active zone minutes.',
      },
      {
        scope: 'heartrate',
        description:
          'Read-only access to heart rate data including intraday and historical heart rate measurements.',
      },
      {
        scope: 'location',
        description:
          'Read-only access to GPS and other location data recorded during activities.',
      },
      {
        scope: 'nutrition',
        description:
          'Read-only access to nutrition data including food logs, water intake, and nutritional values.',
      },
      {
        scope: 'settings',
        description:
          'Read-only access to user account and device settings including timezone and unit preferences.',
      },
      {
        scope: 'sleep',
        description:
          'Read-only access to sleep data including sleep logs and sleep stage information.',
      },
      {
        scope: 'social',
        description:
          'Read-only access to friend lists and leaderboard data (when applicable).',
      },
      {
        scope: 'weight',
        description:
          'Read-only access to weight and body composition data including BMI and body fat percentage.',
      },
      {
        scope: 'oxygen_saturation',
        description: 'Read-only access to SpO2 (blood oxygen saturation) data.',
      },
      {
        scope: 'temperature',
        description:
          'Read-only access to skin temperature data (where available).',
      },
    ],
  },
} satisfies JsonConnectorDef
