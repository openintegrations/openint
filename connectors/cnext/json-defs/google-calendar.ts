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
    openint_scopes: [
      'https://www.googleapis.com/auth/calendar.settings.readonly',
    ],
    scopes: [
      {
        scope: 'https://www.googleapis.com/auth/calendar',
        description:
          "Provides full read/write access to the user's calendars, including events, ACLs (access control lists), and settings. This is the most permissive scope.",
      },
      {
        scope: 'https://www.googleapis.com/auth/calendar.events',
        description:
          "Provides read/write access to events on the user's calendars, but does not include access to calendar metadata (e.g., ACLs or settings).",
      },
      {
        scope: 'https://www.googleapis.com/auth/calendar.events.readonly',
        description:
          "Provides read-only access to events on the user's calendars. No write operations are allowed.",
      },
      {
        scope: 'https://www.googleapis.com/auth/calendar.readonly',
        description:
          "Provides read-only access to the user's calendars, including events, ACLs, and settings. No write operations are allowed.",
      },
      {
        scope: 'https://www.googleapis.com/auth/calendar.settings.readonly',
        description:
          "Provides read-only access to the user's calendar settings (e.g., time zone, working hours). No access to events or calendars.",
      },
    ],
  },
} satisfies JsonConnectorDef
