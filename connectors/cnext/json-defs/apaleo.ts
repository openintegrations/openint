import type {JsonConnectorDef} from '../schema'

export default {
  audience: ['business'],
  verticals: ['other'],
  display_name: 'Apaleo',
  stage: 'alpha',
  version: 1,
  auth: {
    type: 'OAUTH2',
    authorization_request_url: 'https://identity.apaleo.com/connect/authorize',
    token_request_url: 'https://identity.apaleo.com/connect/token',
    scope_separator: ' ',
    params_config: {
      authorize: {response_type: 'code'},
      token: {grant_type: 'authorization_code'},
    },
    openint_default_scopes: ['offline_access', 'openid', 'account.read'],
    openint_allowed_scopes: ['offline_access', 'openid', 'account.read', 'reservation.read', 'finance.read'],
    scopes: [
      {
        scope: 'offline_access',
        description:
          'Allows the application to refresh access tokens when the user is not present, enabling long-term access to resources.',
      },
      {
        scope: 'openid',
        description:
          'Provides access to basic user profile information (subject identifier) through OpenID Connect.',
      },
      {
        scope: 'profile',
        description:
          'Access to basic user profile information (name, email, etc.) beyond just the OpenID subject identifier.',
      },
      {
        scope: 'account.read',
        description:
          'Read-only access to account information (properties, rates, etc.)',
      },
      {
        scope: 'account.manage',
        description:
          'Full access to manage account information including creating and updating properties, rates, etc.',
      },
      {
        scope: 'reservation.read',
        description: 'Read-only access to reservation data',
      },
      {
        scope: 'reservation.manage',
        description: 'Full access to create, update, and cancel reservations',
      },
      {
        scope: 'finance.read',
        description:
          'Read-only access to financial data including invoices and payments',
      },
      {
        scope: 'finance.manage',
        description:
          'Full access to manage financial data including creating invoices and recording payments',
      },
    ],
  },
} satisfies JsonConnectorDef
