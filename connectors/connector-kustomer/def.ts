import type {ConnectorDef, ConnectorSchemas} from '@openint/cdk'
import {connHelpers, oauthBaseSchema} from '@openint/cdk'
import {z} from '@openint/util'

export const zConfig = oauthBaseSchema.connectorConfig

const oReso = oauthBaseSchema.connectionSettings
export const zSettings = oReso.extend({
  oauth: oReso.shape.oauth,
})

export const kustomerSchemas = {
  name: z.literal('kustomer'),
  connectorConfig: zConfig,
  connectionSettings: zSettings,
  connectOutput: oauthBaseSchema.connectOutput,
} satisfies ConnectorSchemas

export const kustomerHelpers = connHelpers(kustomerSchemas)

export const kustomerDef = {
  name: 'kustomer',
  schemas: kustomerSchemas,
  metadata: {
    displayName: 'Kustomer',
    stage: 'beta',
    verticals: ['other'],
    logoUrl: '/_assets/logo-kustomer.svg',
    // TODO: Update opensdks NangoProvider type to include kustomer
    // @ts-expect-error
    nangoProvider: 'kustomer',
  },
} satisfies ConnectorDef<typeof kustomerSchemas>

export default kustomerDef
