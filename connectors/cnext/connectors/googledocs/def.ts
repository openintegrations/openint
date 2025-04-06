import {generateOauthConnectorDef} from '../../oauth2/schema'
import type {JsonConnectorDef} from '../../def'

export const jsonDef = {
  audience: ['business'],
  connector_name: 'googledocs',
  verticals: ['other'],
  display_name: 'Google Docs',
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
    openint_scopes: ['https://www.googleapis.com/auth/documents.readonly'],
    scopes: [
      {
        scope: 'https://www.googleapis.com/auth/documents',
        description:
          'Provides full access to Google Docs, including reading, creating, modifying, and deleting documents.',
      },
      {
        scope: 'https://www.googleapis.com/auth/documents.readonly',
        description:
          'Allows read-only access to Google Docs. Users can view documents but cannot create, modify, or delete them.',
      },
      {
        scope: 'https://www.googleapis.com/auth/drive.file',
        description:
          'Provides access to Google Docs files that the app has created or opened. Does not grant access to all files in Google Drive.',
      },
      {
        scope: 'https://www.googleapis.com/auth/drive.readonly',
        description:
          'Allows read-only access to Google Drive, including viewing Google Docs files. Does not permit modifications or deletions.',
      },
      {
        scope: 'https://www.googleapis.com/auth/drive',
        description:
          'Provides full access to Google Drive, including reading, creating, modifying, and deleting all files and documents.',
      },
    ],
  },
} satisfies JsonConnectorDef

export const def = generateOauthConnectorDef(jsonDef)
