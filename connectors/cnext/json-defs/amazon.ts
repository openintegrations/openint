import type {JsonConnectorDef} from '../schema'

import {z} from '@openint/util/zod-utils'

export default {
  audience: ['business'],
  verticals: ['developer-tools', 'commerce'],
  display_name: 'Amazon',
  stage: 'alpha',
  version: 1,
  auth: {
    type: 'OAUTH2',
    authorization_request_url: 'https://www.amazon.com/ap/oa',
    token_request_url:
      'https://api.amazon.${connection_settings.extension}/auth/o2/token',
    scope_separator: ' ',
    params_config: {
      authorize: {response_type: 'code'},
      token: {grant_type: 'authorization_code'},
    },
    openint_default_scopes: ['sellingpartnerapi::orders'],
    openint_allowed_scopes: ['sellingpartnerapi::orders', 'advertising::campaign:read', 'profile'],
    scopes: [
      {
        scope: 'profile',
        description:
          "Basic access to read the user's profile information (name, email, etc.)",
      },
      {
        scope: 'sellingpartnerapi::migration',
        description: 'Access to migration APIs for Amazon Seller Central',
      },
      {
        scope: 'sellingpartnerapi::notifications',
        description:
          'Access to subscribe to and receive notifications in Amazon Seller Central',
      },
      {
        scope: 'sellingpartnerapi::orders',
        description:
          'Read-only access to order information in Amazon Seller Central',
      },
      {
        scope: 'advertising::campaign:read',
        description: 'Read-only access to advertising campaign data',
      },
      {
        scope: 'sellingpartnerapi::seller-fulfillment',
        description:
          'Access to fulfillment APIs including creating shipments and managing orders',
      },
      {
        scope: 'advertising::campaign:write',
        description: 'Full read/write access to advertising campaign data',
      },
    ],
    connection_settings: z.object({
      extension: z
        .string()
        .regex(/[a-z.]+/)
        .describe('The domain extension for your Amazon account (e.g., com)'),
    }),
  },
} satisfies JsonConnectorDef
