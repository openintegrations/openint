import type {JsonConnectorDef} from '../schema'

export default {
  audience: ['business'],
  verticals: ['other'],
  display_name: 'Tremendous',
  stage: 'alpha',
  version: 1,
  auth: {
    type: 'OAUTH2',
    authorization_request_url: 'https://api.tremendous.com/oauth/authorize',
    token_request_url: 'https://api.tremendous.com/oauth/token',
    scope_separator: ' ',
    params_config: {
      authorize: {response_type: 'code'},
      token: {grant_type: 'authorization_code'},
    },
    openint_default_scopes: ['openid'],
    openint_allowed_scopes: ['openid', 'campaigns.read'],
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
        scope: 'campaigns.read',
        description: 'Read-only access to view incentive campaigns',
      },
      {
        scope: 'campaigns.manage',
        description:
          'Full access to create, update, and manage incentive campaigns',
      },
      {
        scope: 'rewards.read',
        description: 'Read-only access to view reward transactions',
      },
      {
        scope: 'rewards.manage',
        description: 'Full access to create and manage reward transactions',
      },
      {
        scope: 'account.read',
        description: 'Read-only access to account balance and settings',
      },
    ],
  },
} satisfies JsonConnectorDef
