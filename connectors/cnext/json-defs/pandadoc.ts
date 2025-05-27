import type {JsonConnectorDef} from '../schema'

export default {
  audience: ['business'],
  verticals: ['other'],
  display_name: 'Pandadoc',
  stage: 'alpha',
  version: 1,
  auth: {
    type: 'OAUTH2',
    authorization_request_url: 'https://app.pandadoc.com/oauth2/authorize',
    token_request_url: 'https://api.pandadoc.com/oauth2/access_token',
    scope_separator: ' ',
    params_config: {
      authorize: {response_type: 'code'},
      token: {grant_type: 'authorization_code'},
    },
    openint_default_scopes: ['openid'],
    openint_allowed_scopes: ['openid', 'read:documents'],
    scopes: [
      {
        scope: 'openid',
        description:
          'Allows authentication and provides basic user profile information (like user ID)',
      },
      {
        scope: 'read:documents',
        description:
          'Read-only access to document metadata and content (no editing capabilities)',
      },
      {
        scope: 'write:documents',
        description:
          'Create and update documents, including sending for signature',
      },
      {
        scope: 'read:templates',
        description: 'Read-only access to document templates',
      },
      {
        scope: 'write:templates',
        description: 'Create and update document templates',
      },
      {
        scope: 'read:contacts',
        description:
          'Read-only access to contact information (recipients, signers, etc.)',
      },
      {
        scope: 'write:contacts',
        description: 'Create and update contact information',
      },
      {
        scope: 'admin:workspace',
        description:
          'Full administrative access to the workspace including user management',
      },
    ],
  },
} satisfies JsonConnectorDef
