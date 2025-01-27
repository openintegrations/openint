import plaidOas from '@opensdks/sdk-plaid/plaid.oas.json'
import type * as plaid from 'plaid'
import type {PlaidError} from 'plaid'
import {CountryCode, Products} from 'plaid'
import type {PlaidLinkOnSuccessMetadata} from 'react-plaid-link'
import type {ConnectorDef, ConnectorSchemas, OpenApiSpec} from '@openint/cdk'
import {connHelpers, makePostingsMap, zWebhookInput} from '@openint/cdk'
import {A, R, z, zCast} from '@openint/util'
import {
  getPlaidAccountBalance,
  getPlaidAccountFullName,
  getPlaidAccountType,
  plaidUnitForCurrency,
} from './legacy/plaid-helpers'
import {inferPlaidEnvFromToken} from './plaid-utils'
import type {ErrorShape} from './plaid.types'
import {zCountryCode, zLanguage, zPlaidEnvName, zProducts} from './PlaidClient'

export const plaidSchemas = {
  name: z.literal('plaid'),
  // There is a mixing of cases here... Unfortunately...
  connectorConfig: z.object({
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
      .optional(),
    clientName: z
      .string()
      .max(30)
      .default('This Application')
      .describe(
        `The name of your application, as it should be displayed in Link.
        Maximum length of 30 characters.
        If a value longer than 30 characters is provided, Link will display "This Application" instead.`,
      ),
    products: z.array(zProducts).default([Products.Transactions]),
    countryCodes: z
      .array(zCountryCode)
      .default([CountryCode.Us, CountryCode.Ca]),
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
  connectionSettings: z.object({
    itemId: z.string().nullish(),
    accessToken: z.string(),
    institution: zCast<plaid.Institution | undefined>(),
    item: zCast<plaid.Item | undefined>(),
    status: zCast<plaid.ItemGetResponse['status'] | undefined>(),
    /** Comes from webhook */
    webhookItemError: zCast<ErrorShape>().nullish(),
  }),
  integrationData: zCast<plaid.Institution>(),
  preConnectInput: z.object({
    ...(process.env.NODE_ENV === 'production'
      ? {}
      : // Development mode only
        {sandboxPublicTokenCreate: z.boolean().optional()}),
    language: zLanguage.optional(),
  }),
  connectInput: z.union([
    z.object({link_token: z.string()}),
    z.object({public_token: z.string()}),
  ]),
  connectOutput: z.object({
    publicToken: z.string(),
    meta: zCast<PlaidLinkOnSuccessMetadata>().optional(),
  }),
  /** "Manually" extending for now, this will get better / safer */
  sourceState: z
    .object({
      /**
       * Account ids to sync. Should this live in the stream config somehow?
       * We should keep state to only incremental sync state for future
       */
      accountIds: z.array(z.string()).nullish(),
      /** Date to sync since */
      sinceDate: z.string().nullish() /** ISO8601 */,
      transactionSyncCursor: z.string().nullish(),
      /** ISO8601 */
      investmentTransactionEndDate: z.string().nullish(),
    })
    .default({}),
  sourceOutputEntities: R.mapToObj(
    ['transaction', 'account', 'investment_transaction', 'holding'] as const,
    (e) => [e, z.unknown()],
  ),
  sourceOutputEntity: z.discriminatedUnion('entityName', [
    z.object({
      id: z.string(),
      entityName: z.literal('account'),
      entity: zCast<plaid.AccountBase>(),
    }),
    z.object({
      id: z.string(),
      entityName: z.literal('transaction'),
      entity: zCast<plaid.Transaction | plaid.InvestmentTransaction>(),
    }),
  ]),
  webhookInput: zWebhookInput,

  // Temp hack... As unkonwn causes type error during sourceSync, also need .type object
  // otherwise zod-openapi does not like it https://github.com/asteasolutions/zod-to-openapi/issues/196
  destinationState: z.undefined().openapi({type: 'object'}),
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
    entity: {
      account: ({entity: a}, extConn) => ({
        id: a.account_id,
        entityName: 'account',
        entity: {
          name: getPlaidAccountFullName(a, extConn.institution),
          lastFour: a.mask,
          // TODO: Map Plaid account type properly
          type: getPlaidAccountType(a),
          integrationName: extConn.institution?.name,
          informationalBalances: {
            current: getPlaidAccountBalance(a, 'current'),
            available: getPlaidAccountBalance(a, 'available'),
            limit: getPlaidAccountBalance(a, 'limit'),
          },
          defaultUnit: (('balances' in a && a.balances.iso_currency_code) ??
            undefined) as Unit | undefined,
        },
      }),
      transaction: ({entity: t}) => {
        const curr = plaidUnitForCurrency(t)
        const currencyAmount = A(-1 * (t.amount ?? 0), curr)
        const accountExternalId = t.account_id as ExternalId
        if (isInvestmentTransaction(t)) {
          return {
            id: t.investment_transaction_id,
            entityName: 'transaction',
            // TODO: Finish the mapper
            entity: {date: t.date, description: t.name},
          }
        }

        const externalCategory = t.category?.join('/')
        return {
          id: t.transaction_id,
          entityName: 'transaction',
          entity: {
            date: t.date,
            pendingTransactionExternalId:
              t.pending_transaction_id as ExternalId | null,
            description: t.name || '',
            payee: t.merchant_name ?? undefined,
            postingsMap: makePostingsMap({
              main: {
                accountExternalId,
                amount: currencyAmount,
              },
              // Are there any uncategorized at all for Plaid?
            }),
            externalCategory,
            externalStatus: t.pending ? 'pending' : undefined,
          },
        }
      },
    },
    // Should this run at runtime rather than sync time? That way we don't have to
    // keep resyncing the 10k institutions from Plaid to make this happen...
    integration: (ins) => ({
      name: ins.name,
      logo_url: ins.logo ? `data:image/png;base64,${ins.logo}` : undefined,
      login_url: ins.url ?? undefined,
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
        display_name: settings.institution?.name ?? '',
        status:
          err?.error_code === 'ITEM_LOGIN_REQUIRED'
            ? 'disconnected'
            : err
              ? 'error'
              : 'healthy',
        status_message: err?.error_message,
        labels: [envName],
      }
    },
  },
} satisfies ConnectorDef<typeof plaidSchemas>

function isInvestmentTransaction(
  txn: plaid.Transaction | plaid.InvestmentTransaction,
): txn is plaid.InvestmentTransaction {
  return 'investment_transaction_id' in txn
}

export default plaidDef
