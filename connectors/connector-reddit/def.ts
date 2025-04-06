import type {ConnectorDef, ConnectorSchemas} from '@openint/cdk'
import {connHelpers, oauthBaseSchema} from '@openint/cdk'
import {z} from '@openint/util/zod-utils'

export const zConfig = oauthBaseSchema.connector_config

const oConn = oauthBaseSchema.connection_settings
export const zSettings = oConn.extend({
  oauth: oConn.shape.oauth,
})

export const redditSchemas = {
  name: z.literal('reddit'),
  connector_config: zConfig,
  connection_settings: zSettings,
  connect_output: oauthBaseSchema.connect_output,
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
