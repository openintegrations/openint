import type {ConnectorDef, ConnectorSchemas} from '@openint/cdk'
import {connHelpers, oauthBaseSchema} from '@openint/cdk'
import {z} from '@openint/util'

export const zConfig = oauthBaseSchema.connectorConfig

const oConn = oauthBaseSchema.connectionSettings
export const zSettings = oConn.extend({
  oauth: oConn.shape.oauth,
})

export const redditSchemas = {
  name: z.literal('reddit'),
  connectorConfig: zConfig,
  connectionSettings: zSettings,
  connectOutput: oauthBaseSchema.connectOutput,
} satisfies ConnectorSchemas

export const redditHelpers = connHelpers(redditSchemas)

export const redditDef = {
  name: 'reddit',
  schemas: redditSchemas,
  metadata: {
    displayName: 'Reddit',
    stage: 'beta',
    verticals: ['social-media'],
    logoUrl: '/_assets/logo-reddit.svg',
    nangoProvider: 'reddit',
  },
} satisfies ConnectorDef<typeof redditSchemas>

export default redditDef
