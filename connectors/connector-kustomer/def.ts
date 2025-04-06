import type {ConnectorDef, ConnectorSchemas} from '@openint/cdk'
import {connHelpers, oauthBaseSchema} from '@openint/cdk'
import {z} from '@openint/util/zod-utils'

export const zConfig = oauthBaseSchema.connector_config

const oReso = oauthBaseSchema.connection_settings
export const zSettings = oReso.extend({
  oauth: oReso.shape.oauth,
})

export const kustomerSchemas = {
  name: z.literal('kustomer'),
  connector_config: zConfig,
  connection_settings: zSettings,
  connect_output: oauthBaseSchema.connect_output,
} satisfies ConnectorSchemas

export const kustomerHelpers = connHelpers(kustomerSchemas)

export const kustomerDef = {
  name: 'kustomer',
  schemas: kustomerSchemas,
  metadata: {
    displayName: 'Kustomer',
    stage: 'beta',
    verticals: ['communication'],
    logoUrl: '/_assets/logo-kustomer.svg',
    nangoProvider: 'kustomer',
  },
} satisfies ConnectorDef<typeof kustomerSchemas>

export default kustomerDef
