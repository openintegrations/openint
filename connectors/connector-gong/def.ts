import type {ConnectorDef, ConnectorSchemas} from '@openint/cdk'
import {connHelpers, oauthBaseSchema} from '@openint/cdk'
import {z} from '@openint/util/zod-utils'

export const zConfig = oauthBaseSchema.connector_config

const oConn = oauthBaseSchema.connection_settings
export const zSettings = oConn.extend({
  oauth: oConn.shape.oauth,
})

export const gongSchemas = {
  name: z.literal('gong'),
  connector_config: zConfig,
  connection_settings: zSettings,
  connect_output: oauthBaseSchema.connect_output,
} satisfies ConnectorSchemas

export const gongHelpers = connHelpers(gongSchemas)

export const gongDef = {
  name: 'gong',
  schemas: gongSchemas,
  metadata: {
    displayName: 'Gong',
    stage: 'beta',
    verticals: ['sales-enablement'],
    logoUrl: '/_assets/logo-gong.svg',
    nangoProvider: 'gong',
  },
} satisfies ConnectorDef<typeof gongSchemas>

export default gongDef
