import type {JsonConnectorDef} from '../schema'

export default {
  audience: ['business'],
  verticals: ['hris'],
  display_name: 'Deel',
  stage: 'alpha',
  version: 1,
  auth: {
    type: 'OAUTH2',
    authorization_request_url: 'https://app.deel.com/oauth2/authorize',
    token_request_url: 'https://app.deel.com/oauth2/tokens',
    scope_separator: ' ',
    params_config: {
      authorize: {response_type: 'code'},
      token: {grant_type: 'authorization_code'},
    },
    openint_default_scopes: ['openid'],
    openint_allowed_scopes: ['openid', 'profile:read', 'contracts:read', 'invoices:read', 'payments:read'],
    scopes: [
      {
        scope: 'openid',
        description:
          'Allows authentication and provides basic user profile information (like user ID)',
      },
      {
        scope: 'profile:read',
        description:
          'Read-only access to basic user profile information (name, email, etc.)',
      },
      {
        scope: 'contracts:read',
        description: 'Read access to contract information',
      },
      {
        scope: 'contracts:write',
        description: 'Create and update contract information',
      },
      {
        scope: 'invoices:read',
        description: 'Read access to invoice data',
      },
      {
        scope: 'payments:read',
        description: 'Read access to payment information',
      },
      {
        scope: 'admin:full',
        description: 'Full administrative access to all organization data',
      },
    ],
  },
} satisfies JsonConnectorDef
