import type {JsonConnectorDef} from '../schema'

export default {
  audience: ['business'],
  connector_name: 'googlecalendar',
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
    openint_scopes: ['https://www.googleapis.com/auth/calendar.readonly'],
    scopes: [
      {
        scope: 'https://www.googleapis.com/auth/calendar.readonly',
        description:
          'Provides read-only access to events, calendars, and settings. Does not allow modifying or creating any calendar data.',
      },
      {
        scope: 'https://www.googleapis.com/auth/calendar.events.readonly',
        description:
          'Provides read-only access to events (including attendee info and attachments) but not to calendar metadata or settings.',
      },
      {
        scope: 'https://www.googleapis.com/auth/calendar.events',
        description:
          'Provides read/write access to events (create/modify/delete events and manage attendee responses). Does not include access to calendar metadata or settings.',
      },
      {
        scope: 'https://www.googleapis.com/auth/calendar',
        description:
          'Provides full read/write access to calendars, events, and settings (including creating/deleting calendars and modifying sharing permissions).',
      },
      {
        scope: 'https://www.googleapis.com/auth/calendar.settings.readonly',
        description:
          "Provides read-only access to user's calendar settings (timezone, notifications, etc.) without access to calendar contents.",
      },
    ],
  },
} satisfies JsonConnectorDef
