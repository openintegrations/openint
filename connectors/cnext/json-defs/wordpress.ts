import type {JsonConnectorDef} from '../schema'

export default {
  audience: ['business'],
  verticals: ['developer-tools'],
  display_name: 'WordPress',
  stage: 'alpha',
  version: 1,
  auth: {
    type: 'OAUTH2',
    authorization_request_url:
      'https://public-api.wordpress.com/oauth2/authorize',
    token_request_url: 'https://public-api.wordpress.com/oauth2/token',
    scope_separator: ' ',
    params_config: {
      authorize: {response_type: 'code'},
      token: {grant_type: 'authorization_code'},
    },
    openint_default_scopes: ['basic'],
    openint_allowed_scopes: ['basic', 'read'],
    scopes: [
      {
        scope: 'basic',
        description:
          'Allows read-only access to basic user profile information (e.g., ID, username, email). This is the minimal scope required for most authorization flows.',
      },
      {
        scope: 'read',
        description:
          'Allows read-only access to public content such as posts, pages, and media. Does not include private or draft content.',
      },
      {
        scope: 'write',
        description:
          'Allows creating and updating posts, pages, and media. Does not include deletion or access to private content.',
      },
      {
        scope: 'posts',
        description:
          'Allows full access (read, create, update, delete) to posts, including private and draft posts.',
      },
      {
        scope: 'media',
        description:
          'Allows full access (read, upload, update, delete) to media items.',
      },
      {
        scope: 'comments',
        description:
          'Allows full access (read, create, update, delete) to comments.',
      },
      {
        scope: 'users',
        description:
          'Allows read access to user profiles (beyond basic info) and the ability to manage users if the authenticated user has admin privileges.',
      },
    ],
  },
} satisfies JsonConnectorDef
