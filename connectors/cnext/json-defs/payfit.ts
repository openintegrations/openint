import type {JsonConnectorDef} from '../schema'

export default {
  audience: ['business'],
  verticals: ['hris'],
  display_name: 'Payfit',
  stage: 'alpha',
  version: 1,
  auth: {
    type: 'OAUTH2',
    authorization_request_url: 'https://oauth.payfit.com/authorize',
    token_request_url: 'https://app.pagerduty.com/oauth/token',
    scope_separator: ' ',
    params_config: {
      authorize: {response_type: 'code'},
      token: {grant_type: 'authorization_code'},
    },
    openint_default_scopes: ['openid'],
    openint_allowed_scopes: ['openid', 'read:company', 'read:employees'],
    scopes: [
      {
        scope: 'openid',
        description:
          'Allows authentication and basic user profile information (subject identifier)',
      },
      {
        scope: 'profile',
        description:
          'Access to basic user profile information (name, email, etc.)',
      },
      {
        scope: 'read:company',
        description:
          'Read-only access to company information (name, address, legal details)',
      },
      {
        scope: 'read:employees',
        description:
          'Read-only access to employee directory and basic information',
      },
      {
        scope: 'read:payroll',
        description: 'Read-only access to payroll data and reports',
      },
      {
        scope: 'write:employees',
        description: 'Create and update employee records',
      },
      {
        scope: 'write:payroll',
        description: 'Full access to submit and modify payroll data',
      },
      {
        scope: 'admin:company',
        description:
          'Full administrative access to all company data and settings',
      },
    ],
  },
} satisfies JsonConnectorDef
