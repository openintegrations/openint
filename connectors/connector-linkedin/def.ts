import type {ConnectorDef, ConnectorSchemas} from '@openint/cdk'
import {connHelpers, oauthBaseSchema} from '@openint/cdk'
import {z} from '@openint/util'

export const zConfig = oauthBaseSchema.connectorConfig

const oConn = oauthBaseSchema.connectionSettings
export const zSettings = oConn.extend({
  oauth: oConn.shape.oauth,
})

export const linkedinSchemas = {
  name: z.literal('linkedin'),
  connectorConfig: zConfig,
  connectionSettings: zSettings,
  connectOutput: oauthBaseSchema.connectOutput,
} satisfies ConnectorSchemas

export const linkedinHelpers = connHelpers(linkedinSchemas)

export const linkedinDef = {
  name: 'linkedin',
  schemas: linkedinSchemas,
  metadata: {
    displayName: 'LinkedIn',
    stage: 'beta',
    verticals: ['social-media'],
    logoUrl: '/_assets/logo-linkedin.svg',
    nangoProvider: 'linkedin',
  },
} satisfies ConnectorDef<typeof linkedinSchemas>

export default linkedinDef
