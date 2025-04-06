import oas from '@opensdks/sdk-outreach/outreach.oas.json'
import type {ConnectorDef, ConnectorSchemas, OpenApiSpec} from '@openint/cdk'
import {connHelpers, oauthBaseSchema} from '@openint/cdk'
import {z} from '@openint/util/zod-utils'

export const zConfig = oauthBaseSchema.connector_config

const oReso = oauthBaseSchema.connection_settings
export const zSettings = oReso.extend({
  oauth: oReso.shape.oauth,
})

export const outreachSchemas = {
  name: z.literal('outreach'),
  connector_config: zConfig,
  connection_settings: zSettings,
  connect_output: oauthBaseSchema.connect_output,
} satisfies ConnectorSchemas

export const outreachHelpers = connHelpers(outreachSchemas)

export const outreachDef = {
  name: 'outreach',
  schemas: outreachSchemas,
  metadata: {
    displayName: 'Outreach',
    stage: 'beta',
    verticals: ['sales-engagement'],
    logoUrl: '/_assets/logo-outreach.svg',
    nangoProvider: 'outreach',
    openapiSpec: {proxied: oas as unknown as OpenApiSpec},
  },
} satisfies ConnectorDef<typeof outreachSchemas>

export default outreachDef
