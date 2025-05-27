import type {JsonConnectorDef} from '../schema'

export default {
  audience: ['business'],
  verticals: ['hris'],
  display_name: 'Zenefits',
  stage: 'alpha',
  version: 1,
  auth: {
    type: 'OAUTH2',
    authorization_request_url:
      'https://secure.zenefits.com/oauth2/platform-authorize',
    token_request_url: 'https://secure.zenefits.com/oauth2/token',
    scope_separator: ' ',
    params_config: {
      authorize: {response_type: 'code'},
      token: {grant_type: 'authorization_code'},
    },
    openint_default_scopes: ['openid'],
    openint_allowed_scopes: ['openid', 'user:read', 'time_off:read'],
    scopes: [
      {
        scope: 'openid',
        description:
          'Required for OpenID Connect authentication. Provides basic user profile information.',
      },
      {
        scope: 'profile',
        description:
          'Access to basic user profile information (name, email, etc.).',
      },
      {
        scope: 'user:read',
        description: 'Read-only access to user account information.',
      },
      {
        scope: 'company:read',
        description: 'Read-only access to company information.',
      },
      {
        scope: 'employees:read',
        description: 'Read-only access to employee data.',
      },
      {
        scope: 'payroll:read',
        description: 'Read-only access to payroll information.',
      },
      {
        scope: 'time_off:read',
        description: 'Read-only access to time off requests and balances.',
      },
      {
        scope: 'employees:write',
        description: 'Read and write access to employee data.',
      },
      {
        scope: 'payroll:write',
        description: 'Read and write access to payroll information.',
      },
      {
        scope: 'admin',
        description: 'Full administrative access to all company data.',
      },
    ],
  },
} satisfies JsonConnectorDef
