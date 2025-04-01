import {generateOauthConnectorDef} from '../_defaults/oauth2/schema'
import type {JsonConnectorDef} from '../def'

export const jsonDef = {
  audience: ['consumer', 'business'] as const,
  connector_name: 'googledrive' as const,
  verticals: ['file-storage'] as const,
  display_name: 'Google Drive' as const,
  stage: 'ga' as const,
  version: 1 as const,
  links: {
    web_url: 'https://drive.google.com',
    api_docs_url: 'https://developers.google.com/drive',
  },
  auth: {
    type: 'OAUTH2' as const,
    authorization_request_url: 'https://accounts.google.com/o/oauth2/v2/auth',
    token_request_url: 'https://oauth2.googleapis.com/token',
    scope_separator: ' ',
    params_config: {
      authorize: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
    scopes: [
      {
        scope: 'https://www.googleapis.com/auth/drive.readonly',
        description: 'View files and folders in your Google Drive',
      },
      {
        scope: 'https://www.googleapis.com/auth/drive.file',
        description: 'View and manage files created by this app',
      },
      {
        scope: 'https://www.googleapis.com/auth/drive',
        description: 'Full access to files and folders in your Google Drive',
      },
    ],
    openint_scopes: ['https://www.googleapis.com/auth/drive.file'],
  },
} satisfies JsonConnectorDef

export const def = generateOauthConnectorDef(jsonDef)
