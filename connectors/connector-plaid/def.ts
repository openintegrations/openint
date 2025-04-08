import type {ErrorShape} from './plaid.types'
import type {ConnectorDef, ConnectorSchemas, OpenApiSpec} from '@openint/cdk'
import type * as plaid from 'plaid'
import type {PlaidError} from 'plaid'
import type {PlaidLinkOnSuccessMetadata} from 'react-plaid-link'
import plaidOas from '@opensdks/sdk-plaid/plaid.oas.json'
import {CountryCode, Products} from 'plaid'
import {connHelpers, zWebhookInput} from '@openint/cdk'
import {z, zCast} from '@openint/util/zod-utils'
import {inferPlaidEnvFromToken} from './plaid-utils'
import {zCountryCode, zLanguage, zPlaidEnvName, zProducts} from './PlaidClient'

export const plaidSchemas = {
  name: z.literal('plaid'),
  // There is a mixing of cases here... Unfortunately...
  connector_config: z.object({
    // TODO: Change to snake_case... then move envName variable over...
    envName: zPlaidEnvName,
    credentials: z
      .union([
        // TODO: This should be z.literal('default') but it does not render well in the UI :/
        z.null().openapi({title: 'Use OpenInt platform credentials'}),
        z
          .object({
            clientId: z.string(),
            clientSecret: z.string(),
          })
          .openapi({title: 'Use my own'}),
      ])
      .optional()
      .openapi({
        'ui:field': 'CredentialsField',
        'ui:fieldReplacesAnyOrOneOf': true,
      }),
    clientName: z
      .string()
      .max(30)
      .default('This Application')
      .describe(
        `The name of your application, as it should be displayed in Link.
        Maximum length of 30 characters.
        If a value longer than 30 characters is provided, Link will display "This Application" instead.`,
      ),
    products: z.array(zProducts).default([Products.Transactions]).openapi({
      'ui:widget': 'MultiSelectWidget',
    }),
    countryCodes: z
      .array(zCountryCode)
      .default([CountryCode.Us, CountryCode.Ca])
      .openapi({
        'ui:widget': 'MultiSelectWidget',
      }),
    /**
     * When using a Link customization, the language configured
     * here must match the setting in the customization, or the customization will not be applied.
     */
    language: zLanguage.default('en'),

    // integrationDisplayName: z.string().optional().openapi({
    //   example: 'US Bank Accounts',
    //   description:
    //     'When present, will show a single integration instead of one integration per institution supported by Plaid',
    // }),
  }),
  connection_settings: z.object({
    itemId: z.string().nullish(),
    accessToken: z.string(),
    institution: zCast<plaid.Institution | undefined>(),
    item: zCast<plaid.Item | undefined>(),
    status: zCast<plaid.ItemGetResponse['status'] | undefined>(),
    /** Comes from webhook */
    webhookItemError: zCast<ErrorShape>().nullish(),
  }),
  integration_data: zCast<plaid.Institution>(),
  pre_connect_input: z.object({
    ...(process.env.NODE_ENV === 'production'
      ? {}
      : // Development mode only
        {sandboxPublicTokenCreate: z.boolean().optional()}),
    language: zLanguage.optional(),
  }),
  connect_input: z.union([
    z.object({link_token: z.string()}),
    z.object({public_token: z.string()}),
  ]),
  connect_output: z.object({
    public_token: z.string(),
    meta: zCast<PlaidLinkOnSuccessMetadata>().optional(),
  }),
  webhook_input: zWebhookInput,
} satisfies ConnectorSchemas

export const helpers = connHelpers(plaidSchemas)

export const plaidDef = {
  name: 'plaid',
  schemas: plaidSchemas,
  metadata: {
    verticals: ['banking'],
    displayName: 'Plaid',
    stage: 'ga',
    /** https://commons.wikimedia.org/wiki/File:Plaid_logo.svg */
    logoUrl: '/_assets/logo-plaid.svg',
    openapiSpec: {
      proxied: plaidOas as OpenApiSpec,
    },
  },
  standardMappers: {
    // Should this run at runtime rather than sync time? That way we don't have to
    // keep resyncing the 10k institutions from Plaid to make this happen...
    integration: (ins) => ({
      name: ins.name,
      logoUrl: ins.logo ? `data:image/png;base64,${ins.logo}` : undefined,
      loginUrl: ins.url ?? undefined,
      verticals: ['banking'],
    }),
    connection: (settings) => {
      // TODO: Unify item.error and webhookItemError into a single field
      // so we know what the true status of the item is...
      const err =
        (settings.item?.error as PlaidError | null) ?? settings.webhookItemError
      const envName = inferPlaidEnvFromToken(settings.accessToken)
      return {
        id: `${settings.itemId}`,
        displayName: settings.institution?.name ?? '',
        status:
          err?.error_code === 'ITEM_LOGIN_REQUIRED'
            ? 'disconnected'
            : err
              ? 'error'
              : 'healthy',
        statusMessage: err?.error_message,
        labels: [envName],
      }
    },
  },
} satisfies ConnectorDef<typeof plaidSchemas>

export default plaidDef
