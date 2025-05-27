import type {JsonConnectorDef} from '../schema'

export default {
  audience: ['business'],
  verticals: ['accounting'],
  display_name: 'Intuit',
  stage: 'alpha',
  version: 1,
  auth: {
    type: 'OAUTH2',
    authorization_request_url: 'https://appcenter.intuit.com/connect/oauth2',
    token_request_url:
      'https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer',
    scope_separator: ' ',
    params_config: {},
    openint_default_scopes: ['openid'],
    openint_allowed_scopes: ['openid', 'profile', 'com.intuit.quickbooks.accounting'],
    scopes: [
      {
        scope: 'openid',
        description:
          'Provides basic user profile information (name, email) and is required for OpenID Connect authentication flows.',
      },
      {
        scope: 'profile',
        description:
          "Access to user's basic profile information (name, address, phone) without financial data.",
      },
      {
        scope: 'email',
        description: "Access to the user's email address only.",
      },
      {
        scope: 'com.intuit.quickbooks.accounting',
        description:
          'Read-only access to accounting data (invoices, customers, items) in QuickBooks Online.',
      },
      {
        scope: 'com.intuit.quickbooks.accounting.write',
        description:
          'Read and write access to accounting data in QuickBooks Online.',
      },
      {
        scope: 'com.intuit.quickbooks.payment',
        description: 'Access to payment operations and transaction data.',
      },
    ],
  },
} satisfies JsonConnectorDef
