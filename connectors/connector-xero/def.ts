import type {components} from '@opensdks/sdk-xero/xero_accounting.oas.types'
import type {ConnectorDef, ConnectorSchemas} from '@openint/cdk'
import {connHelpers, oauthBaseSchema} from '@openint/cdk'
import {z} from '@openint/util/zod-utils'

export const zConfig = oauthBaseSchema.connectorConfig

const oReso = oauthBaseSchema.connectionSettings
export const zSettings = oReso.extend({
  oauth: oReso.shape.oauth,
})

export type XERO = components['schemas']

export const XERO_ENTITY_NAME = {
  Account: 'Account',
  BankTransaction: 'BankTransaction',
} as const

export const xeroSchemas = {
  name: z.literal('xero'),
  connectorConfig: zConfig,
  connectionSettings: zSettings,
  connectOutput: oauthBaseSchema.connectOutput,
} satisfies ConnectorSchemas

export const xeroHelpers = connHelpers(xeroSchemas)

export const xeroDef = {
  metadata: {
    verticals: ['accounting'],
    logoUrl: '/_assets/logo-xero.svg',
    displayName: 'Xero',
    stage: 'beta',
    nangoProvider: 'xero',
  },
  name: 'xero',
  schemas: xeroSchemas,
} satisfies ConnectorDef<typeof xeroSchemas>

export default xeroDef
