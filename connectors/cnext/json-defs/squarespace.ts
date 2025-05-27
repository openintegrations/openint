import type {JsonConnectorDef} from '../schema'

import {z} from '@openint/util/zod-utils'

export default {
  audience: ['business'],
  verticals: ['developer-tools'],
  display_name: 'Squarespace',
  stage: 'alpha',
  version: 1,
  auth: {
    type: 'OAUTH2',
    authorization_request_url:
      'https://login.squarespace.com/api/1/login/oauth/provider/authorize',
    token_request_url:
      'https://login.squarespace.com/api/1/login/oauth/provider/tokens',
    scope_separator: ',',
    params_config: {
      authorize: {response_type: 'code'},
      token: {grant_type: 'authorization_code'},
    },
    openint_default_scopes: ['offline_access'],
    openint_allowed_scopes: ['offline_access', 'read_site', 'read_inventory', 'read_products'],
    scopes: [
      {
        scope: 'offline_access',
        description:
          'Allows the application to maintain access to Squarespace APIs when the user is not actively using the application (refresh tokens). This is often required for authorization flows.',
      },
      {
        scope: 'read_orders',
        description:
          'Provides read-only access to order information including order details, customer information, and order status.',
      },
      {
        scope: 'read_inventory',
        description:
          'Provides read-only access to inventory levels and product stock information.',
      },
      {
        scope: 'read_customers',
        description:
          'Provides read-only access to customer information including profiles and contact details.',
      },
      {
        scope: 'read_products',
        description:
          'Provides read-only access to product catalog information including product details, variants, and pricing.',
      },
      {
        scope: 'read_site',
        description:
          'Provides read-only access to basic site information including site details, pages, and blog posts. This has the smallest surface area as it only allows reading public site content.',
      },
      {
        scope: 'write_orders',
        description:
          'Provides read and write access to order information, allowing updates to order status and other order details.',
      },
      {
        scope: 'write_inventory',
        description:
          'Provides read and write access to inventory levels, allowing stock adjustments.',
      },
      {
        scope: 'write_products',
        description:
          'Provides read and write access to product catalog, allowing creation and modification of products.',
      },
      {
        scope: 'write_content',
        description:
          'Provides read and write access to site content including pages, blog posts, and other content.',
      },
      {
        scope: 'admin',
        description:
          'Provides full administrative access to all site data and settings. This has the largest surface area.',
      },
    ],
    connection_settings: z.object({
      customappDescription: z
        .string()
        .describe(
          'The user agent of your custom app (e.g., example-subdomain)',
        ),
    }),
  },
} satisfies JsonConnectorDef
