import type {ConnectorDef, ConnectorSchemas} from '@openint/cdk'
import {connHelpers, oauthBaseSchema} from '@openint/cdk'
import {z} from '@openint/util'

export const zConfig = oauthBaseSchema.connectorConfig

const oConn = oauthBaseSchema.connectionSettings
export const zSettings = oConn.extend({
  oauth: oConn.shape.oauth,
})

export const gongSchemas = {
  name: z.literal('gong'),
  connectorConfig: zConfig,
  connectionSettings: zSettings,
  connectOutput: oauthBaseSchema.connectOutput,
} satisfies ConnectorSchemas

export const gongHelpers = connHelpers(gongSchemas)

export const gongDef = {
  name: 'gong',
  schemas: gongSchemas,
  metadata: {
    displayName: 'Gong',
    stage: 'beta',
    verticals: ['other'],
    logoUrl: '/_assets/logo-gong.svg',
    nangoProvider: 'gong',
  },
} satisfies ConnectorDef<typeof gongSchemas>

export default gongDef
