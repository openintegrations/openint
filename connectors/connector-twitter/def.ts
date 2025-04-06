import type {ConnectorDef, ConnectorSchemas} from '@openint/cdk'
import {connHelpers, oauthBaseSchema} from '@openint/cdk'
import {z} from '@openint/util/zod-utils'

export const zConfig = oauthBaseSchema.connector_config

const oConn = oauthBaseSchema.connection_settings
export const zSettings = oConn.extend({
  oauth: oConn.shape.oauth,
})

export const twitterSchemas = {
  name: z.literal('twitter'),
  connector_config: zConfig,
  connection_settings: zSettings,
  connect_output: oauthBaseSchema.connect_output,
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
