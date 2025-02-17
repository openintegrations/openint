import type {ConnectorDef, ConnectorSchemas} from '@openint/cdk'
import {connHelpers, oauthBaseSchema} from '@openint/cdk'
import {z} from '@openint/util'

export const zConfig = oauthBaseSchema.connectorConfig

const oReso = oauthBaseSchema.connectionSettings
export const zSettings = oReso.extend({
  oauth: oReso.shape.oauth,
})

export const confluenceSchemas = {
  name: z.literal('confluence'),
  connectorConfig: zConfig,
  connectionSettings: zSettings,
  connectOutput: oauthBaseSchema.connectOutput,
} satisfies ConnectorSchemas

export const confluenceHelpers = connHelpers(confluenceSchemas)

export const confluenceDef = {
  name: 'confluence',
  schemas: confluenceSchemas,
  metadata: {
    displayName: 'Confluence',
    stage: 'beta',
    verticals: ['wiki'],
    logoUrl: '/_assets/logo-confluence.svg',
    nangoProvider: 'confluence',
  },
} satisfies ConnectorDef<typeof confluenceSchemas>

export default confluenceDef
