import type {JsonConnectorDef} from '../schema'

export default {
  audience: ['business'],
  verticals: ['developer-tools'],
  display_name: 'Wakatime',
  stage: 'alpha',
  version: 1,
  auth: {
    type: 'OAUTH2',
    authorization_request_url: 'https://wakatime.com/oauth/authorize',
    token_request_url: 'https://wakatime.com/oauth/token',
    scope_separator: ' ',
    params_config: {},
    openint_default_scopes: ['email'],
    openint_allowed_scopes: ['email', 'read_stats', 'read_logged_time'],
    scopes: [
      {
        scope: 'read_stats',
        description:
          'Allows read-only access to your WakaTime statistics including coding activity, languages, projects, and other analytics.',
      },
      {
        scope: 'read_logged_time',
        description:
          'Allows access to read your logged coding time and durations, but not other statistics or sensitive information.',
      },
      {
        scope: 'write_logged_time',
        description:
          'Allows creating and updating time entries in your WakaTime logs.',
      },
      {
        scope: 'read_private_stats',
        description:
          "Allows read access to private statistics that aren't available through public profiles.",
      },
      {
        scope: 'email',
        description: 'Allows access to your WakaTime registered email address.',
      },
    ],
  },
} satisfies JsonConnectorDef
