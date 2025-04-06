import type {ConnectorDef, ConnectorSchemas} from '@openint/cdk'
import {connHelpers, oauthBaseSchema} from '@openint/cdk'
import {z} from '@openint/util/zod-utils'

export const zConfig = oauthBaseSchema.connector_config

const oReso = oauthBaseSchema.connection_settings
export const zSettings = oReso.extend({
  oauth: oReso.shape.oauth,
})

export const zohodeskSchemas = {
  name: z.literal('zohodesk'),
  connector_config: zConfig,
  connection_settings: zSettings,
  connect_output: oauthBaseSchema.connect_output,
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
