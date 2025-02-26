import type {ConnectorDef, ConnectorSchemas} from '@openint/cdk'
import {connHelpers, oauthBaseSchema} from '@openint/cdk'
import {z} from '@openint/util'

export const zConfig = oauthBaseSchema.connectorConfig

const oConn = oauthBaseSchema.connectionSettings
export const zSettings = oConn.extend({
  oauth: oConn.shape.oauth,
})

export const linearSchemas = {
  name: z.literal('linear'),
  connectorConfig: zConfig,
  connectionSettings: zSettings,
  connectOutput: oauthBaseSchema.connectOutput,
} satisfies ConnectorSchemas

export const linearHelpers = connHelpers(linearSchemas)

export const linearDef = {
  name: 'linear',
  schemas: linearSchemas,
  metadata: {
    displayName: 'Linear',
    stage: 'beta',
    verticals: ['ticketing'],
    logoUrl: '/_assets/logo-linear.svg',
    nangoProvider: 'linear',
  },
} satisfies ConnectorDef<typeof linearSchemas>

export default linearDef
