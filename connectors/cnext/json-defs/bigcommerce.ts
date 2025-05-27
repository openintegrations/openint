import type {JsonConnectorDef} from '../schema'

import {z} from '@openint/util/zod-utils'

export default {
  audience: ['business'],
  verticals: ['commerce'],
  display_name: 'BigCommerce',
  stage: 'alpha',
  version: 1,
  auth: {
    type: 'OAUTH2',
    authorization_request_url: 'https://login.bigcommerce.com/oauth2/authorize',
    token_request_url: 'https://login.bigcommerce.com/oauth2/token',
    scope_separator: ' ',
    params_config: {
      authorize: {
        response_type: 'code',
        context: 'stores/${connection_settings.storeHash}',
        account_uuid: '${connection_settings.accountUuid}',
      },
      token: {
        context: 'stores/${connection_settings.storeHash}',
        grant_type: 'authorization_code',
      },
    },
    openint_default_scopes: ['store_v2_default'],
    openint_allowed_scopes: ['store_v2_default', 'store_v2_orders_read_only', 'store_v2_products_read_only'],
    scopes: [
      {
        scope: 'store_v2_default',
        description:
          'Provides access to basic store information (read-only) including store profile, currency, and other essential metadata. This is the minimal scope required for most OAuth authorization flows.',
      },
      {
        scope: 'store_v2_orders_read_only',
        description:
          'Read-only access to order information including order status, items, and customer details. Cannot modify any order data.',
      },
      {
        scope: 'store_v2_products_read_only',
        description:
          'Read-only access to product catalog including product details, variants, and inventory levels. Cannot modify product data.',
      },
      {
        scope: 'store_v2_customers_read_only',
        description:
          'Read-only access to customer information including profiles, addresses, and order history. Cannot modify customer data.',
      },
      {
        scope: 'store_v2_content_read_only',
        description:
          'Read-only access to store content including pages, blogs, and scripts. Cannot modify content.',
      },
      {
        scope: 'store_v2_orders',
        description:
          'Full access to order information including the ability to create, update, and cancel orders.',
      },
      {
        scope: 'store_v2_products',
        description:
          'Full access to product catalog including the ability to create, update, and delete products.',
      },
      {
        scope: 'store_v2_customers',
        description:
          'Full access to customer information including the ability to create, update, and delete customer records.',
      },
      {
        scope: 'store_v2_content',
        description:
          'Full access to store content including the ability to create, update, and delete pages, blogs, and scripts.',
      },
      {
        scope: 'store_v2_information',
        description:
          'Full access to store settings and configuration including checkout, shipping, and payment settings.',
      },
      {
        scope: 'store_v2_marketing',
        description:
          'Access to marketing tools including coupons, discounts, and promotions.',
      },
    ],
    connection_settings: z.object({
      storeHash: z
        .string()
        .regex(/[a-zA-Z0-9]+/)
        .describe(
          'The store hash of your BigCommerce account (e.g., Example123)',
        ),
      accountUuid: z
        .string()
        .describe(
          'The account UUID of your BigCommerce account (e.g., 123e4567-e89b-12d3-a456-426614174000)',
        ),
    }),
  },
} satisfies JsonConnectorDef
