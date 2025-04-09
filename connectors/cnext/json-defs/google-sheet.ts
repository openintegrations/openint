import type {JsonConnectorDef} from '../schema'

export default {
  audience: ['business'],
  verticals: ['other'],
  display_name: 'Google Sheet',
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
      'https://www.googleapis.com/auth/spreadsheets.currentonly',
    ],
    scopes: [
      {
        scope: 'https://www.googleapis.com/auth/spreadsheets',
        description:
          'Full access to read, write, and modify all Google Sheets and their properties. This includes creating, deleting, and sharing spreadsheets.',
      },
      {
        scope: 'https://www.googleapis.com/auth/spreadsheets.readonly',
        description:
          'Read-only access to view Google Sheets and their properties, but cannot make any changes or access drive metadata.',
      },
      {
        scope: 'https://www.googleapis.com/auth/drive.file',
        description:
          'Access to only Google Sheets files that the app has created or been explicitly opened by the user. Cannot access all user spreadsheets.',
      },
      {
        scope: 'https://www.googleapis.com/auth/drive.readonly',
        description:
          "Read-only access to all Google Sheets files in the user's Drive, but cannot make modifications.",
      },
      {
        scope: 'https://www.googleapis.com/auth/spreadsheets.currentonly',
        description:
          'Access limited to only the currently opened spreadsheet. Cannot access other spreadsheets or perform drive-level operations.',
      },
    ],
  },
} satisfies JsonConnectorDef
