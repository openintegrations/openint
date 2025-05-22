import type {JsonConnectorDef} from '../schema'

export default {
  audience: ['business'],
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
    openint_default_scopes: [
      'https://www.googleapis.com/auth/drive',
      'https://www.googleapis.com/auth/drive.readonly',
    ],
    openint_allowed_scopes: [
      'https://www.googleapis.com/auth/drive',
      'https://www.googleapis.com/auth/drive.readonly',
    ],
    /**
     * We can review the available scopes here:
     * https://developers.google.com/identity/protocols/oauth2/scopes#docs
     */
    scopes: [
      {
        scope: 'https://www.googleapis.com/auth/documents',
        description:
          'See, edit, create, and delete all your Google Docs documents',
      },
      {
        scope: 'https://www.googleapis.com/auth/documents.readonly',
        description: 'See all your Google Docs documents',
      },
      {
        scope: 'https://www.googleapis.com/auth/drive',
        description:
          'See, edit, create, and delete all of your Google Drive files',
      },
      {
        scope: 'https://www.googleapis.com/auth/drive.file',
        description:
          'See, edit, create, and delete only the specific Google Drive files you use with this app',
      },
      {
        scope: 'https://www.googleapis.com/auth/drive.readonly',
        description: 'See and download all your Google Drive files',
      },
    ],
  },
} satisfies JsonConnectorDef
