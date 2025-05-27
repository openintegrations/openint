import type {JsonConnectorDef} from '../schema'

export default {
  audience: ['business'],
  verticals: ['accounting', 'banking'],
  display_name: 'Pennylane',
  stage: 'alpha',
  version: 1,
  auth: {
    type: 'OAUTH2',
    authorization_request_url: 'https://app.pennylane.com/oauth/authorize',
    token_request_url: 'https://app.pennylane.com/oauth/token',
    scope_separator: '+',
    params_config: {
      authorize: {response_type: 'code'},
      token: {grant_type: 'authorization_code'},
    },
    openint_default_scopes: ['openid', 'email'],
    openint_allowed_scopes: ['openid', 'email', 'transactions:read'],
    scopes: [
      {
        scope: 'openid',
        description:
          'Required for authentication flows. Provides access to basic user profile information (like user ID) during authentication.',
      },
      {
        scope: 'email',
        description:
          "Access to the user's email address. Often required for authentication flows to identify the user.",
      },
      {
        scope: 'profile',
        description:
          'Basic access to user profile information (name, company details).',
      },
      {
        scope: 'transactions:read',
        description: 'Read-only access to financial transactions and entries.',
      },
      {
        scope: 'invoices:read',
        description:
          'Read-only access to invoice data including amounts, dates, and statuses.',
      },
      {
        scope: 'invoices:write',
        description:
          'Create and update invoices, including sending them to clients.',
      },
      {
        scope: 'accounting:read',
        description:
          'Read access to all accounting data including ledgers, journals, and financial statements.',
      },
      {
        scope: 'accounting:write',
        description:
          'Full write access to accounting data including creating transactions and adjusting entries.',
      },
      {
        scope: 'admin',
        description:
          'Full administrative access including company settings, user management, and all financial data.',
      },
    ],
  },
} satisfies JsonConnectorDef
