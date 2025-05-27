import type {JsonConnectorDef} from '../schema'

export default {
  audience: ['business'],
  verticals: ['other'],
  display_name: 'Paypal',
  stage: 'alpha',
  version: 1,
  auth: {
    type: 'OAUTH2',
    authorization_request_url: 'https://www.paypal.com/signin/authorize',
    token_request_url: 'https://api.paypal.com/v1/oauth2/token',
    scope_separator: ' ',
    params_config: {
      authorize: {response_type: 'code'},
      token: {grant_type: 'authorization_code'},
    },
    openint_default_scopes: ['openid'],
    openint_allowed_scopes: ['openid', 'email', 'https://uri.paypal.com/services/disputes/read-only'],
    scopes: [
      {
        scope: 'openid',
        description:
          'Allows access to basic user information (UserInfo endpoint) and enables ID token return. This is the minimal scope required for authentication flows.',
      },
      {
        scope: 'email',
        description:
          "Access to the user's email address. This is a read-only scope with very limited access.",
      },
      {
        scope: 'profile',
        description:
          'Access to basic profile information including name, locale, and user ID.',
      },
      {
        scope: 'https://uri.paypal.com/services/paypalattributes',
        description:
          'Access to PayPal-specific user attributes like account verification status.',
      },
      {
        scope: 'https://uri.paypal.com/services/expresscheckout',
        description: 'Allows processing payments via PayPal Express Checkout.',
      },
      {
        scope: 'https://uri.paypal.com/services/subscriptions',
        description:
          'Allows managing and processing recurring payments/subscriptions.',
      },
      {
        scope: 'https://uri.paypal.com/services/payments/refund',
        description:
          'Allows refunding payments (limited to refund operations only).',
      },
      {
        scope: 'https://uri.paypal.com/services/disputes/read-only',
        description: 'Read-only access to dispute and claim information.',
      },
      {
        scope: 'https://uri.paypal.com/services/disputes/update',
        description: 'Allows responding to and updating disputes.',
      },
      {
        scope: 'https://uri.paypal.com/services/wallet',
        description:
          "Access to user's PayPal wallet including balance information.",
      },
    ],
  },
} satisfies JsonConnectorDef
