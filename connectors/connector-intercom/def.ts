import type {ConnectorDef, ConnectorSchemas} from '@openint/cdk'
import {connHelpers, oauthBaseSchema} from '@openint/cdk'
import {z} from '@openint/util/zod-utils'

export const zConfig = oauthBaseSchema.connector_config

const oConn = oauthBaseSchema.connection_settings
export const zSettings = oConn.extend({
  oauth: oConn.shape.oauth,
})

export const intercomSchemas = {
  name: z.literal('intercom'),
  connector_config: zConfig,
  connection_settings: zSettings,
  connect_output: oauthBaseSchema.connect_output,
} satisfies ConnectorSchemas

export const intercomHelpers = connHelpers(intercomSchemas)

export const intercomDef = {
  name: 'intercom',
  schemas: intercomSchemas,
  metadata: {
    displayName: 'Intercom',
    stage: 'beta',
    verticals: ['communication'],
    logoUrl: '/_assets/logo-intercom.svg',
    nangoProvider: 'intercom',
  },
} satisfies ConnectorDef<typeof intercomSchemas>

export default intercomDef
