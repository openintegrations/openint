import type {JsonConnectorDef} from '../schema'

export default {
  audience: ['business'],
  verticals: ['hris'],
  display_name: 'TSheets',
  stage: 'alpha',
  version: 1,
  auth: {
    type: 'OAUTH2',
    authorization_request_url: 'https://rest.tsheets.com/api/v1/authorize',
    token_request_url: 'https://rest.tsheets.com/api/v1/grant',
    scope_separator: ' ',
    params_config: {
      authorize: {response_type: 'code'},
      token: {grant_type: 'authorization_code'},
    },
    openint_default_scopes: ['openid'],
    openint_allowed_scopes: ['openid', 'profile', 'com.intuit.quickbooks.accounting'],
    scopes: [
      {
        scope: 'openid',
        description:
          'Provides access to authenticate the user and retrieve basic user profile information',
      },
      {
        scope: 'profile',
        description:
          'Access to basic user profile information (name, email, etc.)',
      },
      {
        scope: 'com.intuit.quickbooks.accounting',
        description: 'Read-only access to accounting data',
      },
      {
        scope: 'com.intuit.quickbooks.payroll',
        description: 'Access to payroll data and functions',
      },
      {
        scope: 'com.intuit.quickbooks.payment',
        description: 'Access to payment processing functions',
      },
      {
        scope: 'com.intuit.quickbooks.time_tracking.readonly',
        description:
          'Read-only access to time tracking data (smallest TSheets-specific scope)',
      },
      {
        scope: 'com.intuit.quickbooks.time_tracking',
        description: 'Full access to time tracking data (create, read, update)',
      },
      {
        scope: 'offline_access',
        description: 'Allows obtaining refresh tokens for long-term access',
      },
    ],
  },
} satisfies JsonConnectorDef
