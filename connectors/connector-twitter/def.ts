import type {ConnectorDef, ConnectorSchemas} from '@openint/cdk'
import {connHelpers, oauthBaseSchema} from '@openint/cdk'
import {z} from '@openint/util'

export const zConfig = oauthBaseSchema.connectorConfig

const oConn = oauthBaseSchema.connectionSettings
export const zSettings = oConn.extend({
  oauth: oConn.shape.oauth,
})

export const twitterSchemas = {
  name: z.literal('twitter'),
  connectorConfig: zConfig,
  connectionSettings: zSettings,
  connectOutput: oauthBaseSchema.connectOutput,
} satisfies ConnectorSchemas

export const twitterHelpers = connHelpers(twitterSchemas)

export const twitterDef = {
  name: 'twitter',
  schemas: twitterSchemas,
  metadata: {
    displayName: 'Twitter',
    stage: 'beta',
    verticals: ['social-media'],
    logoUrl: '/_assets/logo-twitter.svg',
    nangoProvider: 'twitter',
  },
} satisfies ConnectorDef<typeof twitterSchemas>

export default twitterDef
