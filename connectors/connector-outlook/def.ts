import type {ConnectorDef, ConnectorSchemas} from '@openint/cdk'
import {connHelpers, oauthBaseSchema} from '@openint/cdk'
import {z} from '@openint/util'

export const zConfig = oauthBaseSchema.connectorConfig

const oReso = oauthBaseSchema.resourceSettings
export const zSettings = oReso.extend({
  oauth: oReso.shape.oauth,
})

export const outlookSchemas = {
  name: z.literal('outlook'),
  connectorConfig: zConfig,
  resourceSettings: zSettings,
  connectOutput: oauthBaseSchema.connectOutput,
} satisfies ConnectorSchemas

export const outlookHelpers = connHelpers(outlookSchemas)

export const outlookDef = {
  name: 'outlook',
  schemas: outlookSchemas,
  metadata: {
    displayName: 'outlook',
    stage: 'beta',
    verticals: ['other'],
    logoUrl: '/_assets/logo-outlook.svg',
    // TODO: update  nango SDK version to support outlook key
    nangoProvider: 'outlook' as any,
  },
} satisfies ConnectorDef<typeof outlookSchemas>

export default outlookDef
