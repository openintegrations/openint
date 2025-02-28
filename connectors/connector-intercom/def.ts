import type {ConnectorDef, ConnectorSchemas} from '@openint/cdk'
import {connHelpers, oauthBaseSchema} from '@openint/cdk'
import {z} from '@openint/util'

export const zConfig = oauthBaseSchema.connectorConfig

const oConn = oauthBaseSchema.connectionSettings
export const zSettings = oConn.extend({
  oauth: oConn.shape.oauth,
})

export const intercomSchemas = {
  name: z.literal('intercom'),
  connectorConfig: zConfig,
  connectionSettings: zSettings,
  connectOutput: oauthBaseSchema.connectOutput,
} satisfies ConnectorSchemas

export const intercomHelpers = connHelpers(intercomSchemas)

export const intercomDef = {
  name: 'intercom',
  schemas: intercomSchemas,
  metadata: {
    displayName: 'Intercom',
    stage: 'beta',
    verticals: ['communication'],
    logoUrl: '/_assets/logo-intercom.svg',
    nangoProvider: 'intercom',
  },
} satisfies ConnectorDef<typeof intercomSchemas>

export default intercomDef
