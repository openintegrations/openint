import type {ConnectorDef, ConnectorSchemas} from '@openint/cdk'
import {connHelpers, oauthBaseSchema} from '@openint/cdk'
import {z} from '@openint/util'
import type {qboOasTypes} from '@opensdks/sdk-qbo/types'

export type QBO = qboOasTypes['components']['schemas']

export const zConfig = oauthBaseSchema.connectorConfig.extend({
  envName: z.enum(['sandbox', 'production']),
  url: z.string().nullish().describe('For proxies, not typically needed'),
  verifierToken: z.string().nullish().describe('For webhooks'),
})

const oReso = oauthBaseSchema.connectionSettings
/** Very verbose definition... Do we want it a bit simpler maybe? */
export const zSettings = oReso.extend({
  oauth: oReso.shape.oauth.extend({
    connection_config: z.object({
      realmId: z.string(),
    }),
    credentials: oReso.shape.oauth.shape.credentials.extend({
      raw: oReso.shape.oauth.shape.credentials.shape.raw.extend({
        refresh_token: z.string().nullish(),
      }),
    }),
  }),
})

export const qboSchemas = {
  name: z.literal('qbo'),
  connectorConfig: zConfig,
  connectionSettings: zSettings,
  connectOutput: oauthBaseSchema.connectOutput,
} satisfies ConnectorSchemas

export const qboHelpers = connHelpers(qboSchemas)

export const qboDef = {
  name: 'qbo',
  schemas: qboSchemas,
  metadata: {
    displayName: 'Quickbooks',
    stage: 'beta',
    verticals: ['accounting'],
    logoUrl: '/_assets/logo-qbo.svg',
    nangoProvider: 'quickbooks',
  },
} satisfies ConnectorDef<typeof qboSchemas>

export default qboDef
