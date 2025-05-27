import type {JsonConnectorDef} from '../schema'

export default {
  audience: ['business'],
  verticals: ['streaming'],
  display_name: 'Vimeo (OAuth)',
  stage: 'alpha',
  version: 1,
  auth: {
    type: 'OAUTH2',
    authorization_request_url: 'https://api.vimeo.com/oauth/authorize',
    token_request_url: 'https://api.vimeo.com/oauth/access_token',
    scope_separator: ' ',
    params_config: {
      authorize: {response_type: 'code'},
      token: {grant_type: 'authorization_code'},
    },
    openint_default_scopes: ['upload'],
    openint_allowed_scopes: ['upload', 'public'],
    scopes: [
      {
        scope: 'public',
        description: 'Access public data only (no user-specific information)',
      },
      {
        scope: 'private',
        description:
          'Access private user data (videos, account info) but no upload/modification rights',
      },
      {
        scope: 'create',
        description: 'Upload new videos and create new albums/collections',
      },
      {
        scope: 'edit',
        description: 'Edit and delete existing videos, albums, and collections',
      },
      {
        scope: 'delete',
        description: 'Permanently delete videos and other content',
      },
      {
        scope: 'interact',
        description: 'Like videos, follow users, and add comments',
      },
      {
        scope: 'upload',
        description: "Upload videos (more limited than 'create' scope)",
      },
    ],
  },
} satisfies JsonConnectorDef
