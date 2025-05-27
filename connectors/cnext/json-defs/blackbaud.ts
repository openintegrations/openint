import type {JsonConnectorDef} from '../schema'

export default {
  audience: ['business'],
  verticals: ['crm'],
  display_name: 'Blackbaud',
  stage: 'alpha',
  version: 1,
  auth: {
    type: 'OAUTH2',
    authorization_request_url: 'https://app.blackbaud.com/oauth/authorize',
    token_request_url: 'https://oauth2.sky.blackbaud.com/token',
    scope_separator: ' ',
    params_config: {
      authorize: {response_type: 'code'},
      token: {grant_type: 'authorization_code'},
    },
    openint_default_scopes: ['openid', 'offline_access'],
    openint_allowed_scopes: ['openid', 'offline_access', 'constituent_read'],
    scopes: [
      {
        scope: 'openid',
        description:
          'Required for OpenID Connect authentication. Allows retrieval of basic user profile information.',
      },
      {
        scope: 'profile',
        description:
          'Provides access to basic user profile information (name, email, etc.) when combined with openid scope.',
      },
      {
        scope: 'offline_access',
        description:
          'Allows obtaining refresh tokens for long-lived access when the user is not present.',
      },
      {
        scope: 'constituent_read',
        description:
          'Read-only access to constituent data (donors, volunteers, etc.).',
      },
      {
        scope: 'constituent_write',
        description: 'Read and write access to constituent data.',
      },
      {
        scope: 'gift_read',
        description: 'Read-only access to gift/donation records.',
      },
      {
        scope: 'gift_write',
        description: 'Read and write access to gift/donation records.',
      },
      {
        scope: 'financial',
        description:
          'Full access to financial data including gifts, payments, and journal entries.',
      },
      {
        scope: 'administration',
        description: 'Access to administrative functions and system settings.',
      },
    ],
  },
} satisfies JsonConnectorDef
