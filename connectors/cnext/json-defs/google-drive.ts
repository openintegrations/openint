import type {JsonConnectorDef} from '../schema'

export const jsonDef = {
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
    openint_scopes: ['https://www.googleapis.com/auth/drive.metadata.readonly'],
    scopes: [
      {
        scope: 'https://www.googleapis.com/auth/drive',
        description:
          "Full, permissive scope to access all of a user's Google Drive files including the ability to read, modify, create, and delete all files and file metadata, including shared files.",
      },
      {
        scope: 'https://www.googleapis.com/auth/drive.file',
        description:
          'Provides access to only the files that the app has created or opened, and requires explicit user action to select files. Cannot access existing files unless the user selects them.',
      },
      {
        scope: 'https://www.googleapis.com/auth/drive.appdata',
        description:
          'Provides access to application-specific data stored in Google Drive (in the appdata folder). Files created with this scope are hidden from the user and other apps by default.',
      },
      {
        scope: 'https://www.googleapis.com/auth/drive.metadata',
        description:
          'Provides read-only access to file metadata (such as titles, parents, and properties) but does not allow access to file content. Can view file information but cannot download or modify content.',
      },
      {
        scope: 'https://www.googleapis.com/auth/drive.metadata.readonly',
        description:
          'Provides read-only access to file metadata (titles, parents, and properties) without the ability to view or download file content. The most restricted metadata-only access.',
      },
      {
        scope: 'https://www.googleapis.com/auth/drive.photos.readonly',
        description:
          "Provides read-only access to the user's Google Photos videos and photos stored in Google Drive (specialized for media files).",
      },
      {
        scope: 'https://www.googleapis.com/auth/drive.readonly',
        description:
          "Provides read-only access to all of a user's Google Drive files, including file content and metadata, but no modification capabilities.",
      },
      {
        scope: 'https://www.googleapis.com/auth/drive.scripts',
        description:
          'Provides access to Google Apps Script projects stored in Google Drive, allowing creation, modification, and execution of scripts.',
      },
    ],
  },
} satisfies JsonConnectorDef
