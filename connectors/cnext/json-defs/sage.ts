import type {JsonConnectorDef} from '../schema'

export default {
  audience: ['business'],
  verticals: ['accounting'],
  display_name: 'Sage',
  stage: 'alpha',
  version: 1,
  auth: {
    type: 'OAUTH2',
    authorization_request_url: 'https://www.sageone.com/oauth2/auth/central',
    token_request_url: 'https://oauth.accounting.sage.com/token',
    scope_separator: ' ',
    params_config: {authorize: {filter: 'apiv3.1'}},
    openint_default_scopes: ['openid', 'offline_access'],
    openint_allowed_scopes: ['openid', 'offline_access', 'accounting.transactions.read'],
    scopes: [
      {
        scope: 'openid',
        description:
          'Allows access to basic user profile information (like user ID) for authentication purposes.',
      },
      {
        scope: 'profile',
        description:
          'Provides read access to basic user profile information including name and email address.',
      },
      {
        scope: 'accounting.transactions.read',
        description: 'Read-only access to accounting transactions.',
      },
      {
        scope: 'accounting.transactions',
        description:
          'Full access to accounting transactions including create, update, and delete capabilities.',
      },
      {
        scope: 'accounting.contacts.read',
        description: 'Read-only access to contact information.',
      },
      {
        scope: 'accounting.contacts',
        description:
          'Full access to contacts including create, update, and delete capabilities.',
      },
      {
        scope: 'accounting.settings',
        description: 'Full access to accounting settings and configuration.',
      },
      {
        scope: 'offline_access',
        description:
          'Allows the application to refresh access tokens when the user is not present.',
      },
    ],
  },
} satisfies JsonConnectorDef
