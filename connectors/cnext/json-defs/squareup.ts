import type {JsonConnectorDef} from '../schema'

export default {
  audience: ['business'],
  verticals: ['other'],
  display_name: 'Squareup',
  stage: 'alpha',
  version: 1,
  auth: {
    type: 'OAUTH2',
    authorization_request_url: 'https://connect.squareup.com/oauth2/authorize',
    token_request_url: 'https://connect.squareup.com/oauth2/token',
    scope_separator: ' ',
    params_config: {
      authorize: {response_type: 'code', session: 'false'},
      token: {grant_type: 'authorization_code'},
    },
    openint_default_scopes: ['MERCHANT_PROFILE_READ'],
    openint_allowed_scopes: ['MERCHANT_PROFILE_READ', 'PAYMENTS_READ', 'ORDERS_READ'],
    scopes: [
      {
        scope: 'MERCHANT_PROFILE_READ',
        description:
          "Read access to the merchant's business and location information. This includes business name, address, currency, and other profile details.",
      },
      {
        scope: 'PAYMENTS_READ',
        description:
          'Read access to payment information. This includes transaction amounts, statuses, and timestamps, but not full card details.',
      },
      {
        scope: 'ORDERS_READ',
        description:
          'Read access to order information. This includes order details, line items, and order statuses.',
      },
      {
        scope: 'CUSTOMERS_READ',
        description:
          'Read access to customer information. This includes customer profiles, contact information, and notes.',
      },
      {
        scope: 'EMPLOYEES_READ',
        description:
          'Read access to employee information. This includes employee profiles, roles, and statuses.',
      },
      {
        scope: 'TIMECARDS_READ',
        description:
          'Read access to employee timecards. This includes clock-in/clock-out times and hours worked.',
      },
      {
        scope: 'ITEMS_READ',
        description:
          'Read access to item and inventory information. This includes product details, variations, and stock levels.',
      },
      {
        scope: 'PAYMENTS_WRITE',
        description:
          'Write access to process payments and refunds. This includes creating new transactions and issuing refunds.',
      },
      {
        scope: 'ORDERS_WRITE',
        description:
          'Write access to create and update orders. This includes creating new orders and modifying existing ones.',
      },
      {
        scope: 'CUSTOMERS_WRITE',
        description:
          'Write access to create and update customer information. This includes adding new customers and modifying existing profiles.',
      },
      {
        scope: 'ITEMS_WRITE',
        description:
          'Write access to create and update items and inventory. This includes adding new products and modifying inventory levels.',
      },
    ],
  },
} satisfies JsonConnectorDef
