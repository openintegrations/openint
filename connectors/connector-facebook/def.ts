import type {ConnectorDef, ConnectorSchemas} from '@openint/cdk'
import {connHelpers, oauthBaseSchema} from '@openint/cdk'
import {z} from '@openint/util/zod-utils'

export const zConfig = oauthBaseSchema.connectorConfig

const oConn = oauthBaseSchema.connectionSettings
export const zSettings = oConn.extend({
  oauth: oConn.shape.oauth,
})

export const facebookSchemas = {
  name: z.literal('facebook'),
  connectorConfig: zConfig,
  connectionSettings: zSettings,
  connectOutput: oauthBaseSchema.connectOutput,
} satisfies ConnectorSchemas

export const facebookHelpers = connHelpers(facebookSchemas)

export const facebookDef = {
  name: 'facebook',
  schemas: facebookSchemas,
  metadata: {
    displayName: 'Facebook',
    stage: 'beta',
    verticals: ['social-media'],
    logoUrl: '/_assets/logo-facebook.svg',
    nangoProvider: 'facebook',
  },
} satisfies ConnectorDef<typeof facebookSchemas>

export default facebookDef
