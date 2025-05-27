import type {JsonConnectorDef} from '../schema'

import {z} from '@openint/util/zod-utils'

export default {
  audience: ['business'],
  verticals: ['other'],
  display_name: 'Adyen',
  stage: 'alpha',
  version: 1,
  auth: {
    type: 'OAUTH2',
    authorization_request_url:
      'https://ca-${connection_settings.environment}.adyen.com/ca/ca/oauth/connect.shtml',
    token_request_url:
      'https://oauth-${connection_settings.environment}.adyen.com/v1/token',
    scope_separator: ' ',
    params_config: {
      authorize: {response_type: 'code'},
      token: {grant_type: 'authorization_code'},
    },
    openint_default_scopes: ['openid'],
    openint_allowed_scopes: ['openid', 'reports_read'],
    scopes: [
      {
        scope: 'psp_management_api',
        description:
          'Allows access to the PSP Management API for creating and managing payment service providers',
      },
      {
        scope: 'balance_platform_api',
        description:
          'Provides access to the Balance Platform API for managing accounts, balance transfers, and payment instruments',
      },
      {
        scope: 'management_api',
        description:
          'Full access to the Management API including merchant accounts, users, and webhooks',
      },
      {
        scope: 'payment_links_api',
        description: 'Allows creation and management of payment links',
      },
      {
        scope: 'checkout_api',
        description: 'Access to the Checkout API for processing payments',
      },
      {
        scope: 'reports_read',
        description: 'Read-only access to financial reports and settlements',
      },
      {
        scope: 'openid',
        description: 'Required for OpenID Connect authentication flows',
      },
    ],
    connection_settings: z.object({
      environment: z
        .string()
        .regex(/(live|test)/)
        .describe('The environment to use (e.g., live|test)'),
      resource: z
        .string()
        .regex(/https:\/\/([a-z0-9_-]+)-\(live\|test\)\.adyen\.com/)
        .describe(
          'The resource to use for your various requests (e.g., https://kyc-(live|test).adyen.com)',
        ),
    }),
  },
} satisfies JsonConnectorDef
