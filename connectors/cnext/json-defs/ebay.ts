import type {JsonConnectorDef} from '../schema'

export default {
  audience: ['business'],
  verticals: ['commerce'],
  display_name: 'eBay',
  stage: 'alpha',
  version: 1,
  auth: {
    type: 'OAUTH2',
    authorization_request_url: 'https://auth.ebay.com/oauth2/authorize',
    token_request_url: 'https://api.ebay.com/identity/v1/oauth2/token',
    scope_separator: ' ',
    params_config: {
      authorize: {response_type: 'code'},
      token: {grant_type: 'authorization_code'},
    },
    openint_default_scopes: ['https://api.ebay.com/oauth/api_scope'],
    openint_allowed_scopes: [
      'https://api.ebay.com/oauth/api_scope',
      'https://api.ebay.com/oauth/api_scope/commerce.identity.readonly',
      'https://api.ebay.com/oauth/api_scope/sell.inventory.readonly'
    ],
    scopes: [
      {
        scope: 'https://api.ebay.com/oauth/api_scope',
        description:
          'Base scope required for all API authorization flows. Allows the application to make authorized calls on behalf of a user.',
      },
      {
        scope:
          'https://api.ebay.com/oauth/api_scope/commerce.identity.readonly',
        description:
          'Read-only access to basic user identity information (user ID, username, email address, etc.).',
      },
      {
        scope: 'https://api.ebay.com/oauth/api_scope/sell.inventory.readonly',
        description: 'Read-only access to seller inventory information.',
      },
      {
        scope: 'https://api.ebay.com/oauth/api_scope/sell.inventory',
        description: 'Full access to seller inventory (read and write).',
      },
      {
        scope: 'https://api.ebay.com/oauth/api_scope/sell.account.readonly',
        description: 'Read-only access to seller account information.',
      },
      {
        scope: 'https://api.ebay.com/oauth/api_scope/sell.account',
        description:
          'Full access to seller account information (read and write).',
      },
      {
        scope: 'https://api.ebay.com/oauth/api_scope/sell.fulfillment.readonly',
        description: 'Read-only access to order fulfillment information.',
      },
      {
        scope: 'https://api.ebay.com/oauth/api_scope/sell.fulfillment',
        description: 'Full access to order fulfillment (read and write).',
      },
      {
        scope:
          'https://api.ebay.com/oauth/api_scope/commerce.notification.subscription',
        description:
          'Access to manage notification subscriptions for marketplace events.',
      },
    ],
  },
} satisfies JsonConnectorDef
