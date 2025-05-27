import type {JsonConnectorDef} from '../schema'

export default {
  audience: ['business'],
  verticals: ['commerce'],
  display_name: 'Gumroad',
  stage: 'alpha',
  version: 1,
  auth: {
    type: 'OAUTH2',
    authorization_request_url: 'https://gumroad.com/oauth/authorize',
    token_request_url: 'https://api.gumroad.com/oauth/token',
    scope_separator: ' ',
    params_config: {
      authorize: {response_type: 'code'},
      token: {grant_type: 'authorization_code'},
    },
    openint_default_scopes: ['view_profile'],
    openint_allowed_scopes: ['view_profile', 'view_sales'],
    scopes: [
      {
        scope: 'view_profile',
        description:
          'Allows read-only access to basic user profile information (name, email, profile URL)',
      },
      {
        scope: 'view_sales',
        description:
          'Allows read-only access to sales data and transaction history',
      },
      {
        scope: 'manage_products',
        description: 'Allows creating, updating, and managing products',
      },
      {
        scope: 'edit_profile',
        description: 'Allows modifying user profile information',
      },
      {
        scope: 'view_emails',
        description: 'Allows access to customer email addresses from sales',
      },
      {
        scope: 'view_shop',
        description:
          'Allows read-only access to shop configuration and settings',
      },
      {
        scope: 'edit_shop',
        description: 'Allows modifying shop configuration and settings',
      },
    ],
  },
} satisfies JsonConnectorDef
