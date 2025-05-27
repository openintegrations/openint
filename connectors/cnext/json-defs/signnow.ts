import type {JsonConnectorDef} from '../schema'

export default {
  audience: ['business'],
  verticals: ['other'],
  display_name: 'SignNow',
  stage: 'alpha',
  version: 1,
  auth: {
    type: 'OAUTH2',
    authorization_request_url: 'https://app.signnow.com/authorize',
    token_request_url: 'https://api.signnow.com/oauth2/token',
    scope_separator: ' ',
    params_config: {
      authorize: {response_type: 'code'},
      token: {grant_type: 'authorization_code'},
    },
    openint_default_scopes: ['user'],
    openint_allowed_scopes: ['user', 'document.read'],
    scopes: [
      {
        scope: 'user',
        description:
          'Access basic user profile information (email, name, etc.)',
      },
      {
        scope: 'document.read',
        description: 'Read-only access to documents and templates',
      },
      {
        scope: 'document.create',
        description: 'Create new documents and templates',
      },
      {
        scope: 'document.all',
        description:
          'Full access to all document operations (read, create, update, delete, send for signing)',
      },
      {
        scope: 'team',
        description: 'Manage team members and group settings',
      },
      {
        scope: 'signature.request',
        description:
          'Send documents for signature and manage signature requests',
      },
    ],
  },
} satisfies JsonConnectorDef
