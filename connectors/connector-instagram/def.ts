import type {ConnectorDef, ConnectorSchemas} from '@openint/cdk'
import {connHelpers, oauthBaseSchema} from '@openint/cdk'
import {z} from '@openint/util/zod-utils'

export const zConfig = oauthBaseSchema.connector_config

const oConn = oauthBaseSchema.connection_settings
export const zSettings = oConn.extend({
  oauth: oConn.shape.oauth,
})

export const instagramSchemas = {
  name: z.literal('instagram'),
  connector_config: zConfig,
  connection_settings: zSettings,
  connect_output: oauthBaseSchema.connect_output,
} satisfies ConnectorSchemas

export const instagramHelpers = connHelpers(instagramSchemas)

export const instagramDef = {
  name: 'instagram',
  schemas: instagramSchemas,
  metadata: {
    displayName: 'Instagram',
    stage: 'beta',
    verticals: ['social-media'],
    logoUrl: '/_assets/logo-instagram.svg',
    nangoProvider: 'instagram',
  },
} satisfies ConnectorDef<typeof instagramSchemas>

export default instagramDef
