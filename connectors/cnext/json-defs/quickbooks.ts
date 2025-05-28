import type {JsonConnectorDef} from '../schema'

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
    required_scopes: ['openid'],
    openint_default_scopes: ['openid', 'com.intuit.quickbooks.accounting'],
    openint_allowed_scopes: [
      'openid',
      'com.intuit.quickbooks.accounting',
      'com.intuit.quickbooks.payment',
    ],
    /**
     * Official QuickBooks Online scopes documentation:
     * https://developer.intuit.com/app/developer/qbo/docs/learn/scopes
     */
    scopes: [
      {
        scope: 'com.intuit.quickbooks.accounting',
        description:
          'Grants access to the QuickBooks Online Accounting API, which focuses on accounting data.',
      },
      {
        scope: 'com.intuit.quickbooks.payment',
        description:
          'Grants access to the QuickBooks Payments API, which focuses on payments processing.',
      },
      {
        scope: 'openid',
        description:
          "Grants access to OpenID Connect features. Include one or more of the following capabilities: profile – User's given and family names info, email – User's email address info, phone – User's phone number info, address – User's physical address info",
      },
    ],
    // These are not currently working... We need to add custom postConnect script and then fix it
    // connection_settings: z.object({
    //   realmId: z
    //     .string()
    //     .regex(/\d{16}/)
    //     .describe(
    //       'The realmId of your quickbooks company (e.g., 9341453474484455)',
    //     ),
    // }),
    // connector_config: z.object({
    //   envName: z.enum(['sandbox', 'production']).default('sandbox'),
    // }),
  },
} satisfies JsonConnectorDef
