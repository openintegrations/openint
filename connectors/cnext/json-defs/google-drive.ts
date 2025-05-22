import type {JsonConnectorDef} from '../schema'

export default {
  audience: ['business'],
  verticals: ['wiki', 'file-storage'],
  display_name: 'Google Drive',
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
      'https://www.googleapis.com/auth/drive.appdata',
      'https://www.googleapis.com/auth/drive.file',
    ],
    openint_allowed_scopes: [
      'https://www.googleapis.com/auth/drive.appdata',
      'https://www.googleapis.com/auth/drive.file',
    ],
    /**
     * We can review the available scopes here:
     * https://developers.google.com/identity/protocols/oauth2/scopes#drive
     */
    scopes: [
      {
        scope: 'https://www.googleapis.com/auth/drive',
        description:
          'See, edit, create, and delete all of your Google Drive files',
      },
      {
        scope: 'https://www.googleapis.com/auth/drive.appdata',
        description:
          'See, create, and delete its own configuration data in your Google Drive',
      },
      {
        scope: 'https://www.googleapis.com/auth/drive.apps.readonly',
        description: 'View your Google Drive apps',
      },
      {
        scope: 'https://www.googleapis.com/auth/drive.file',
        description:
          'See, edit, create, and delete only the specific Google Drive files you use with this app',
      },
      {
        scope: 'https://www.googleapis.com/auth/drive.meet.readonly',
        description:
          'See and download your Google Drive files that were created or edited by Google Meet',
      },
      {
        scope: 'https://www.googleapis.com/auth/drive.metadata',
        description: 'View and manage metadata of files in your Google Drive',
      },
      {
        scope: 'https://www.googleapis.com/auth/drive.metadata.readonly',
        description: 'See information about your Google Drive files',
      },
      {
        scope: 'https://www.googleapis.com/auth/drive.photos.readonly',
        description: 'View the photos, videos and albums in your Google Photos',
      },
      {
        scope: 'https://www.googleapis.com/auth/drive.readonly',
        description: 'See and download all your Google Drive files',
      },
      {
        scope: 'https://www.googleapis.com/auth/drive.scripts',
        description: "Modify your Google Apps Script scripts' behavior",
      },
    ],
  },
} satisfies JsonConnectorDef
