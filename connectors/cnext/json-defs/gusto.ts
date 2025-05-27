import type {JsonConnectorDef} from '../schema'

export default {
  audience: ['business'],
  verticals: ['hris'],
  display_name: 'Gusto',
  stage: 'alpha',
  version: 1,
  auth: {
    type: 'OAUTH2',
    authorization_request_url: 'https://api.gusto.com/oauth/authorize',
    token_request_url: 'https://api.gusto.com/oauth/token',
    scope_separator: ' ',
    params_config: {
      authorize: {response_type: 'code'},
      token: {grant_type: 'authorization_code'},
    },
    openint_default_scopes: ['openid'],
    openint_allowed_scopes: ['openid', 'read:user', 'read:employees'],
    scopes: [
      {
        scope: 'openid',
        description:
          'Provides access to basic user profile information (like user ID) during authentication. This is often required for OAuth flows.',
      },
      {
        scope: 'email',
        description:
          "Provides access to the user's email address during authentication.",
      },
      {
        scope: 'profile',
        description:
          'Provides access to basic profile information (name, picture, etc.) during authentication.',
      },
      {
        scope: 'read:user',
        description:
          'Read-only access to user account information (excluding sensitive data like SSN or bank details).',
      },
      {
        scope: 'read:companies',
        description:
          'Read-only access to company information the user has access to.',
      },
      {
        scope: 'read:employees',
        description:
          'Read-only access to employee data (excluding sensitive information).',
      },
      {
        scope: 'write:employees',
        description:
          'Read and write access to employee data (excluding sensitive information).',
      },
      {
        scope: 'read:payrolls',
        description: 'Read-only access to payroll information.',
      },
      {
        scope: 'write:payrolls',
        description: 'Read and write access to payroll information.',
      },
      {
        scope: 'read:benefits',
        description: 'Read-only access to employee benefits information.',
      },
      {
        scope: 'admin:companies',
        description:
          'Full administrative access to all company data the user has permissions for.',
      },
    ],
  },
} satisfies JsonConnectorDef
