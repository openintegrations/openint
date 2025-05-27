import type {JsonConnectorDef} from '../schema'

export default {
  audience: ['business'],
  verticals: ['other'],
  display_name: 'BoldSign',
  stage: 'alpha',
  version: 1,
  auth: {
    type: 'OAUTH2',
    authorization_request_url: 'https://account.boldsign.com/connect/authorize',
    token_request_url: 'https://account.boldsign.com/connect/token',
    scope_separator: ' ',
    params_config: {
      authorize: {response_type: 'code'},
      token: {grant_type: 'authorization_code'},
    },
    openint_default_scopes: ['openid', 'esign.read'],
    openint_allowed_scopes: ['openid', 'profile', 'esign.read'],
    scopes: [
      {
        scope: 'openid',
        description:
          'Provides access to basic user profile information (like user ID) for authentication purposes',
      },
      {
        scope: 'profile',
        description:
          'Provides access to basic user profile information (name, email, etc.)',
      },
      {
        scope: 'esign.read',
        description: 'Read-only access to e-signature documents and statuses',
      },
      {
        scope: 'esign.write',
        description: 'Create and send documents for e-signature',
      },
      {
        scope: 'esign.manage',
        description:
          'Full management of e-signature documents including sending, canceling, and downloading',
      },
      {
        scope: 'account.read',
        description: 'Read access to account information and settings',
      },
      {
        scope: 'account.manage',
        description: 'Full management of account settings and configurations',
      },
    ],
  },
} satisfies JsonConnectorDef
