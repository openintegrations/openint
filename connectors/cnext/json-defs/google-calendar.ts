import type {JsonConnectorDef} from '../schema'

export default {
  audience: ['business'],
  verticals: ['other'],
  display_name: 'Google Calendar',
  stage: 'ga',
  version: 1,
  auth: {
    type: 'OAUTH2',
    authorization_request_url: 'https://accounts.google.com/o/oauth2/v2/auth',
    token_request_url: 'https://oauth2.googleapis.com/token',
    scope_separator: ' ',
    params_config: {
      authorize: {
        response_type: 'code',
        access_type: 'offline',
        prompt: 'consent',
      },
    },
    openint_default_scopes: [
      'https://www.googleapis.com/auth/calendar.settings.readonly',
    ],
    openint_allowed_scopes: [
      'https://www.googleapis.com/auth/calendar.settings.readonly',
    ],
    /**
     * We can review the available scopes here:
     * https://developers.google.com/identity/protocols/oauth2/scopes#calendar
     */
    scopes: [
      {
        scope: 'https://www.googleapis.com/auth/calendar',
        description:
          'See, edit, share, and permanently delete all the calendars you can access using Google Calendar',
      },
      {
        scope: 'https://www.googleapis.com/auth/calendar.events',
        description: 'View and edit events on all your calendars',
      },
      {
        scope: 'https://www.googleapis.com/auth/calendar.events.readonly',
        description: 'View events on all your calendars',
      },
      {
        scope: 'https://www.googleapis.com/auth/calendar.readonly',
        description:
          'See and download any calendar you can access using your Google Calendar',
      },
      {
        scope: 'https://www.googleapis.com/auth/calendar.settings.readonly',
        description: 'View your Calendar settings',
      },
    ],
  },
} satisfies JsonConnectorDef
