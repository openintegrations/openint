import type {ConnectorDef, ConnectorSchemas} from '@openint/cdk'
import {connHelpers, oauthBaseSchema} from '@openint/cdk'
import {z} from '@openint/util'

export const zConfig = oauthBaseSchema.connectorConfig

const oReso = oauthBaseSchema.connectionSettings
export const zSettings = oReso.extend({
  oauth: oReso.shape.oauth,
})

export const zohodeskSchemas = {
  name: z.literal('zohodesk'),
  connectorConfig: zConfig,
  connectionSettings: zSettings,
  connectOutput: oauthBaseSchema.connectOutput,
} satisfies ConnectorSchemas

export const zohodeskHelpers = connHelpers(zohodeskSchemas)

export const zohodeskDef = {
  name: 'zohodesk',
  schemas: zohodeskSchemas,
  metadata: {
    displayName: 'Zoho Desk',
    stage: 'beta',
    verticals: ['communication'],
    logoUrl: '/_assets/logo-zohodesk.svg',
    nangoProvider: 'zoho-desk',
  },
} satisfies ConnectorDef<typeof zohodeskSchemas>

export default zohodeskDef
