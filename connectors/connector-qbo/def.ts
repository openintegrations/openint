import type {qboOasTypes} from '@opensdks/sdk-qbo/types'
import type {ConnectorDef, ConnectorSchemas} from '@openint/cdk'
import {connHelpers, oauthBaseSchema, zEntityPayload} from '@openint/cdk'
import type {EnumOf} from '@openint/util'
import {R, z} from '@openint/util'

export type QBO = qboOasTypes['components']['schemas']

export type TransactionTypeName = Extract<
  QBO['EntityName'],
  'Purchase' | 'Deposit' | 'JournalEntry' | 'Invoice' | 'Payment'
>

export const TRANSACTION_TYPE_NAME: EnumOf<TransactionTypeName> = {
  Purchase: 'Purchase',
  Deposit: 'Deposit',
  JournalEntry: 'JournalEntry',
  Invoice: 'Invoice',
  Payment: 'Payment',
}

export const QBO_ENTITY_NAME: EnumOf<QBO['EntityName'] | 'Attachable'> = {
  ...TRANSACTION_TYPE_NAME,
  Account: 'Account',
  Bill: 'Bill',
  BillPayment: 'BillPayment',
  CreditMemo: 'CreditMemo',
  Transfer: 'Transfer',
  Vendor: 'Vendor',
  Customer: 'Customer',
  Item: 'Item',
  CompanyInfo: 'CompanyInfo',
  BalanceSheet: 'BalanceSheet',
  ProfitAndLoss: 'ProfitAndLoss',
  Attachable: 'Attachable',
}

export const zConfig = oauthBaseSchema.connectorConfig.extend({
  envName: z.enum(['sandbox', 'production']),
  url: z.string().nullish().describe('For proxies, not typically needed'),
  verifierToken: z.string().nullish().describe('For webhooks'),
})

const oReso = oauthBaseSchema.connectionSettings
/** Very verbose definition... Do we want it a bit simpler maybe? */
export const zSettings = oReso.extend({
  oauth: oReso.shape.oauth.extend({
    connection_config: z.object({
      realmId: z.string(),
    }),
    credentials: oReso.shape.oauth.shape.credentials.extend({
      raw: oReso.shape.oauth.shape.credentials.shape.raw.extend({
        refresh_token: z.string().nullish(),
      }),
    }),
  }),
})

export const qboSchemas = {
  name: z.literal('qbo'),
  connectorConfig: zConfig,
  connectionSettings: zSettings,
  connectOutput: oauthBaseSchema.connectOutput,
  sourceState: z.record(
    z.string(),
    z.object({
      max_last_updated_time: z.string().nullish(),
    }),
  ),
  sourceOutputEntity: zEntityPayload,
  sourceOutputEntities: R.mapValues(
    Object.fromEntries(
      Object.entries(QBO_ENTITY_NAME).filter(
        ([key]) => key !== 'BalanceSheet' && key !== 'ProfitAndLoss',
      ),
    ),
    () => z.unknown().optional(),
  ),
} satisfies ConnectorSchemas

export const qboHelpers = connHelpers(qboSchemas)

export const qboDef = {
  name: 'qbo',
  schemas: qboSchemas,
  metadata: {
    displayName: 'Quickbooks',
    stage: 'beta',
    verticals: ['accounting'],
    logoUrl: '/_assets/logo-qbo.svg',
    nangoProvider: 'quickbooks',
  },
  streams: {
    $defaults: {
      primaryKey: 'Id',
      cursorField: 'MetaData.LastUpdatedTime',
    },
  },
} satisfies ConnectorDef<typeof qboSchemas>

export default qboDef
