import type {ConnectorDef, ConnectorSchemas} from '@openint/cdk'
import {connHelpers, oauthBaseSchema} from '@openint/cdk'
import {z} from '@openint/util'

export const zConfig = oauthBaseSchema.connectorConfig

const oReso = oauthBaseSchema.connectionSettings
export const zSettings = oReso.extend({
  oauth: oReso.shape.oauth,
})

export const slackSchemas = {
  name: z.literal('slack'),
  connectorConfig: zConfig,
  connectionSettings: zSettings,
  connectOutput: oauthBaseSchema.connectOutput,
} satisfies ConnectorSchemas

export const slackHelpers = connHelpers(slackSchemas)

export const slackDef = {
  name: 'slack',
  schemas: slackSchemas,
  metadata: {
    displayName: 'slack',
    stage: 'beta',
    verticals: ['other'],
    logoUrl: '/_assets/logo-slack.svg',
    nangoProvider: 'slack',
  },
} satisfies ConnectorDef<typeof slackSchemas>

export default slackDef
