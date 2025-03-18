import type {ConnectorDef, ConnectorSchemas} from '@openint/cdk'
import {connHelpers, oauthBaseSchema} from '@openint/cdk'
import {z} from '@openint/util'

export const zConfig = oauthBaseSchema.connectorConfig

const oConn = oauthBaseSchema.connectionSettings
export const zSettings = oConn.extend({
  oauth: oConn.shape.oauth,
})

export const instagramSchemas = {
  name: z.literal('instagram'),
  connectorConfig: zConfig,
  connectionSettings: zSettings,
  connectOutput: oauthBaseSchema.connectOutput,
} satisfies ConnectorSchemas

export const instagramHelpers = connHelpers(instagramSchemas)

export const instagramDef = {
  name: 'instagram',
  schemas: instagramSchemas,
  metadata: {
    displayName: 'Instagram',
    stage: 'beta',
    verticals: ['social-media'],
    logoUrl: '/_assets/logo-instagram.svg',
    nangoProvider: 'instagram',
  },
} satisfies ConnectorDef<typeof instagramSchemas>

export default instagramDef
