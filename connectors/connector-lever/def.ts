import type {ConnectorDef, ConnectorSchemas, OpenApiSpec} from '@openint/cdk'
import {connHelpers, oauthBaseSchema} from '@openint/cdk'
import {z} from '@openint/util/zod-utils'
import leverOas from '@opensdks/sdk-lever/lever.oas.json'

export const zConfig = oauthBaseSchema.connector_config.extend({
  envName: z.enum(['sandbox', 'production']),
})

/**
 * Full list of OAuth scopes: https://hire.lever.co/developer/documentation#scopes
 */
const oReso = oauthBaseSchema.connection_settings
export const zSettings = oReso.extend({
  oauth: oReso.shape.oauth,
})

export const leverSchemas = {
  name: z.literal('lever'),
  connector_config: zConfig,
  connection_settings: zSettings,
  connect_output: oauthBaseSchema.connect_output,
} satisfies ConnectorSchemas

export const leverHelpers = connHelpers(leverSchemas)

export const leverDef = {
  name: 'lever',
  schemas: leverSchemas,
  metadata: {
    displayName: 'Lever',
    stage: 'beta',
    verticals: ['ats'],
    logoUrl: '/_assets/logo-lever.svg',
    nangoProvider: 'lever-sandbox', // TODO: make this support production!
    openapiSpec: {proxied: leverOas as unknown as OpenApiSpec},
  },
} satisfies ConnectorDef<typeof leverSchemas>

export default leverDef
