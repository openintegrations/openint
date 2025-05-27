import type {JsonConnectorDef} from '../schema'

export default {
  audience: ['business'],
  verticals: ['hris'],
  display_name: 'Factorial',
  stage: 'alpha',
  version: 1,
  auth: {
    type: 'OAUTH2',
    authorization_request_url: 'https://api.factorialhr.com/oauth/authorize',
    token_request_url: 'https://api.factorialhr.com/oauth/token',
    scope_separator: ' ',
    params_config: {},
    openint_default_scopes: ['openid'],
    openint_allowed_scopes: ['openid', 'profile', 'read:employees', 'read:time_off'],
    scopes: [
      {
        scope: 'openid',
        description:
          'Authenticate users and request basic profile information (subject identifier)',
      },
      {
        scope: 'profile',
        description:
          'Access basic user profile information (name, email, etc.)',
      },
      {
        scope: 'read:employees',
        description:
          'Read employee directory information (names, positions, contact info)',
      },
      {
        scope: 'write:employees',
        description: 'Create and update employee records',
      },
      {
        scope: 'read:time_off',
        description: 'View employee time off requests and balances',
      },
      {
        scope: 'write:time_off',
        description: 'Create and approve time off requests',
      },
      {
        scope: 'admin:all',
        description:
          'Full administrative access to all company data and settings',
      },
    ],
  },
} satisfies JsonConnectorDef
