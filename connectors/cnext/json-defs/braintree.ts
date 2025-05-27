import type {JsonConnectorDef} from '../schema'

export default {
  audience: ['business'],
  verticals: ['other'],
  display_name: 'Braintree',
  stage: 'alpha',
  version: 1,
  auth: {
    type: 'OAUTH2',
    authorization_request_url: 'https://api.braintreegateway.com/oauth/connect',
    token_request_url: 'https://api.braintreegateway.com/oauth/access_tokens',
    scope_separator: ',',
    params_config: {token: {grant_type: 'authorization_code'}},
    openint_default_scopes: ['client'],
    openint_allowed_scopes: ['client', 'read_only'],
    scopes: [
      {
        scope: 'read_only',
        description:
          'Provides read-only access to transaction data, customer information, and payment methods. Cannot modify any data.',
      },
      {
        scope: 'manage_payment_methods',
        description:
          'Allows creating, updating, and deleting payment methods (credit cards, PayPal accounts, etc.) for customers.',
      },
      {
        scope: 'transactions',
        description:
          'Provides access to process transactions (sales, authorizations, refunds, voids) and view transaction history.',
      },
      {
        scope: 'manage_customers',
        description:
          'Allows creating, updating, and deleting customer records in the Vault.',
      },
      {
        scope: 'full_access',
        description:
          'Provides complete access to all Braintree API functionality including sensitive operations like merchant account configuration and settlement.',
      },
      {
        scope: 'client',
        description:
          'Required scope for client-side authorization flows. Allows generating client tokens for client-side SDK initialization.',
      },
    ],
  },
} satisfies JsonConnectorDef
