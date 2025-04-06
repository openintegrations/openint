import type {ConnectorDef, ConnectorSchemas} from '@openint/cdk'
import {connHelpers, oauthBaseSchema} from '@openint/cdk'
import {z} from '@openint/util/zod-utils'

export const zConfig = oauthBaseSchema.connector_config

const oConn = oauthBaseSchema.connection_settings
export const zSettings = oConn.extend({
  oauth: oConn.shape.oauth,
})

export const facebookSchemas = {
  name: z.literal('facebook'),
  connector_config: zConfig,
  connection_settings: zSettings,
  connect_output: oauthBaseSchema.connect_output,
} satisfies ConnectorSchemas

export const facebookHelpers = connHelpers(facebookSchemas)

export const facebookDef = {
  name: 'facebook',
  schemas: facebookSchemas,
  metadata: {
    displayName: 'Facebook',
    stage: 'beta',
    verticals: ['social-media'],
    logoUrl: '/_assets/logo-facebook.svg',
    nangoProvider: 'facebook',
  },
} satisfies ConnectorDef<typeof facebookSchemas>

export default facebookDef
