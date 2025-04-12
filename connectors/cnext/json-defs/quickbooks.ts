import type {JsonConnectorDef} from '../schema'

import {z} from '@openint/util/zod-utils'

export default {
  audience: ['business'],
  verticals: ['accounting'],
  display_name: 'Quickbooks',
  stage: 'ga',
  version: 1,
  auth: {
    type: 'OAUTH2',
    authorization_request_url: 'https://appcenter.intuit.com/connect/oauth2',
    token_request_url:
      'https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer',
    scope_separator: ' ',
    params_config: {},
    openint_scopes: ['openid'],
    scopes: [
      {
        scope: 'com.intuit.quickbooks.accounting',
        description:
          'Full access to accounting data including customers, vendors, invoices, payments, expenses, and all other accounting entities. Allows read and write operations.',
      },
      {
        scope: 'com.intuit.quickbooks.accounting.readonly',
        description:
          'Read-only access to accounting data including customers, vendors, invoices, payments, expenses, and other accounting entities. No write operations allowed.',
      },
      {
        scope: 'com.intuit.quickbooks.payment',
        description:
          'Access to payment operations including processing payments and viewing payment information. Required for integrating with QuickBooks Payments.',
      },
      {
        scope: 'com.intuit.quickbooks.payroll',
        description:
          'Access to payroll data including employee information, pay runs, and payroll items. Allows read and write operations.',
      },
      {
        scope: 'com.intuit.quickbooks.payroll.readonly',
        description:
          'Read-only access to payroll data including employee information, pay runs, and payroll items. No write operations allowed.',
      },
      {
        scope: 'com.intuit.quickbooks.salesreceipt',
        description:
          'Access to sales receipt operations including creating, updating, and viewing sales receipts.',
      },
      {
        scope: 'openid',
        description:
          'Basic authentication and user profile information (name, email). Does not provide access to any QuickBooks company data.',
      },
      {
        scope: 'email',
        description:
          "Access to the user's email address only. Minimal scope that doesn't provide access to any QuickBooks company data.",
      },
      {
        scope: 'profile',
        description:
          "Access to basic user profile information (name, address, phone). Doesn't provide access to any QuickBooks company data.",
      },
      {
        scope: 'phone',
        description:
          "Access to the user's phone number only. Minimal scope that doesn't provide access to any QuickBooks company data.",
      },
      {
        scope: 'address',
        description:
          "Access to the user's address information only. Doesn't provide access to any QuickBooks company data.",
      },
    ],
    connection_settings: z.object({
      realmId: z
        .string()
        .regex(/\d{16}/)
        .describe(
          'The realmId of your quickbooks company (e.g., 9341453474484455)',
        ),
    }),
    connector_config: z.object({
      envName: z.enum(['sandbox', 'production']).default('sandbox'),
    }),
  },
} satisfies JsonConnectorDef
