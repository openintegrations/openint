import type {JsonConnectorDef} from '../schema'

import {z} from '@openint/util/zod-utils'

export default {
  audience: ['business'],
  verticals: ['other'],
  display_name: 'Mailchimp',
  stage: 'alpha',
  version: 1,
  auth: {
    type: 'OAUTH2',
    authorization_request_url: 'https://login.mailchimp.com/oauth2/authorize',
    token_request_url: 'https://login.mailchimp.com/oauth2/token',
    scope_separator: ' ',
    params_config: {authorize: {response_type: 'code'}},
    openint_default_scopes: ['openid'],
    openint_allowed_scopes: ['openid', 'profile', 'audiences_read', 'campaigns_read'],
    scopes: [
      {
        scope: 'profile',
        description:
          'Read-only access to basic user profile information (name, account info, etc.)',
      },
      {
        scope: 'openid',
        description:
          'Required for OAuth 2.0 authorization flows. Provides basic authentication information.',
      },
      {
        scope: 'audiences_read',
        description: 'Read-only access to audience/list information',
      },
      {
        scope: 'audiences_write',
        description: 'Read and write access to audience/list information',
      },
      {
        scope: 'campaigns_read',
        description: 'Read-only access to campaign information',
      },
      {
        scope: 'campaigns_write',
        description: 'Read and write access to campaign information',
      },
      {
        scope: 'ecommerce_read',
        description:
          'Read-only access to ecommerce store and product information',
      },
      {
        scope: 'ecommerce_write',
        description:
          'Read and write access to ecommerce store and product information',
      },
      {
        scope: 'manage_accounts',
        description:
          'Full access to manage Mailchimp accounts (highest privilege)',
      },
    ],
    connection_settings: z.object({
      dc: z
        .string()
        .regex(/[a-z]+\d*/)
        .describe('The data center for your account (e.g., us6)'),
    }),
  },
} satisfies JsonConnectorDef
