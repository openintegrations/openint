import type {JsonConnectorDef} from '../schema'

export default {
  audience: ['business'],
  verticals: ['accounting'],
  display_name: 'Fortnox',
  stage: 'alpha',
  version: 1,
  auth: {
    type: 'OAUTH2',
    authorization_request_url: 'https://apps.fortnox.se/oauth-v1/auth',
    token_request_url: 'https://apps.fortnox.se/oauth-v1/token',
    scope_separator: ' ',
    params_config: {
      authorize: {response_type: 'code', access_type: 'offline'},
      token: {grant_type: 'authorization_code'},
    },
    openint_default_scopes: ['offline_access'],
    openint_allowed_scopes: ['offline_access', 'profile', 'invoice.read'],
    scopes: [
      {
        scope: 'profile',
        description:
          'Read-only access to basic user profile information (name, email, company details)',
      },
      {
        scope: 'invoice',
        description:
          'Read and write access to invoices including creation, updating, and deletion',
      },
      {
        scope: 'invoice.read',
        description: 'Read-only access to invoices (view but no modifications)',
      },
      {
        scope: 'customer',
        description:
          'Full access to customer data including creation, updating, and deletion',
      },
      {
        scope: 'customer.read',
        description: 'Read-only access to customer data',
      },
      {
        scope: 'settings',
        description: 'Access to company settings and configuration',
      },
      {
        scope: 'offline_access',
        description:
          'Allows obtaining refresh tokens for long-term access when user is not present',
      },
      {
        scope: 'article',
        description:
          'Full access to articles including creation, updating, and deletion',
      },
      {
        scope: 'article.read',
        description: 'Read-only access to articles',
      },
    ],
  },
} satisfies JsonConnectorDef
