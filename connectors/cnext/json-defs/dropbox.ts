import type {JsonConnectorDef} from '../schema'

export default {
  audience: ['business'],
  verticals: ['wiki', 'file-storage'],
  display_name: 'Dropbox',
  stage: 'alpha',
  version: 1,
  auth: {
    type: 'OAUTH2',
    authorization_request_url: 'https://www.dropbox.com/oauth2/authorize',
    token_request_url: 'https://api.dropboxapi.com/oauth2/token',
    scope_separator: ' ',
    params_config: {authorize: {token_access_type: 'offline'}},
    openint_default_scopes: ['files.metadata.read'],
    openint_allowed_scopes: ['account_info.read', 'files.content.read', 'files.metadata.read'],
    scopes: [
      {
        scope: 'account_info.read',
        description:
          'Read basic account information (name, email, etc.) but no access to files or other sensitive data.',
      },
      {
        scope: 'account_info.write',
        description:
          'Read and write basic account information (can update profile details).',
      },
      {
        scope: 'files.content.read',
        description: "Read content of files and folders in the user's Dropbox.",
      },
      {
        scope: 'files.content.write',
        description:
          "Read and write content of files and folders in the user's Dropbox.",
      },
      {
        scope: 'files.metadata.read',
        description:
          'Read metadata about files and folders (without accessing content).',
      },
      {
        scope: 'files.metadata.write',
        description:
          'Read and write metadata about files and folders (rename, move, etc.).',
      },
      {
        scope: 'sharing.read',
        description:
          'View shared files and folders, but cannot modify sharing settings.',
      },
      {
        scope: 'sharing.write',
        description:
          'View and modify shared files and folders (create and manage shares).',
      },
    ],
  },
} satisfies JsonConnectorDef
