import type {JsonConnectorDef} from '../schema'

import {z} from '@openint/util/zod-utils'

export default {
  audience: ['business'],
  verticals: ['commerce'],
  display_name: 'Shopify (OAuth)',
  stage: 'alpha',
  version: 1,
  auth: {
    type: 'OAUTH2',
    authorization_request_url:
      'https://${connection_settings.subdomain}.myshopify.com/admin/oauth/authorize',
    token_request_url:
      'https://${connection_settings.subdomain}.myshopify.com/admin/oauth/access_token',
    scope_separator: ' ',
    params_config: {},
    openint_default_scopes: ['unauthenticated_read_product_listings'],
    openint_allowed_scopes: [
      'unauthenticated_read_product_listings',
      'read_orders',
    ],
    scopes: [
      {
        scope: 'read_products',
        description:
          'Allows reading product information, including titles, descriptions, variants, and collections.',
      },
      {
        scope: 'write_products',
        description:
          'Allows creating, updating, and deleting products, variants, and collections.',
      },
      {
        scope: 'read_orders',
        description:
          'Allows reading order information including order details, line items, and fulfillment status.',
      },
      {
        scope: 'write_orders',
        description:
          'Allows creating, updating, and canceling orders, and managing fulfillments.',
      },
      {
        scope: 'read_customers',
        description:
          'Allows reading customer information including contact details and order history.',
      },
      {
        scope: 'write_customers',
        description:
          'Allows creating, updating, and deleting customer records.',
      },
      {
        scope: 'read_script_tags',
        description:
          'Allows reading script tags which are used to add JavaScript to storefront pages.',
      },
      {
        scope: 'write_script_tags',
        description:
          'Allows creating, updating, and deleting script tags which inject JavaScript into storefront pages.',
      },
      {
        scope: 'read_content',
        description:
          'Allows reading pages, blogs, and articles in the online store.',
      },
      {
        scope: 'write_content',
        description:
          'Allows creating, updating, and deleting pages, blogs, and articles in the online store.',
      },
      {
        scope: 'read_themes',
        description: 'Allows reading theme information and templates.',
      },
      {
        scope: 'write_themes',
        description:
          'Allows creating, updating, and deleting themes and templates.',
      },
      {
        scope: 'read_analytics',
        description: 'Allows reading store analytics and reports.',
      },
      {
        scope: 'read_users',
        description:
          'Allows reading staff account information (names and email addresses only).',
      },
      {
        scope: 'unauthenticated_read_product_listings',
        description:
          'Allows reading product listings without authentication (public access to product info).',
      },
    ],
    connection_settings: z.object({
      subdomain: z
        .string()
        .regex(/https:\/\/([a-z0-9_-]+)\.myshopify\.com/)
        .describe(
          'The subdomain of your Shopify account (e.g., https://domain.myshopify.com)',
        ),
    }),
  },
} satisfies JsonConnectorDef
