import type {ConnectorDef, ConnectorSchemas} from '@openint/cdk'
import {connHelpers, oauthBaseSchema} from '@openint/cdk'
import {z} from '@openint/util'

export const zConfig = oauthBaseSchema.connectorConfig

const oReso = oauthBaseSchema.connectionSettings
export const zSettings = oReso.extend({
  oauth: oReso.shape.oauth,
  client_id: z.string().optional(),
})

export const microsoftSchemas = {
  name: z.literal('microsoft'),
  connectorConfig: z.object({
    oauth: z.object({
      client_id: z.string(),
      client_secret: z.string(),
      scopes: z
        .string()
        .optional()
        .describe('global microsoft connector space separated scopes'),
    }),
    integrations: z.object({
      sharepoint: z
        .object({
          enabled: z.boolean().optional(),
          scopes: z
            .string()
            .optional()
            // Sites.Read.All, Sites.ReadWrite.All, Sites.Manage.All, Sites.FullControl.All Delegated permissions: Sites.Read.All, Sites.ReadWrite.All
            .describe('sharepoint specific space separated scopes'),
        })
        .optional(),
    }),
  }),
  connectionSettings: zSettings,
  connectOutput: oauthBaseSchema.connectOutput,
} satisfies ConnectorSchemas

export const microsoftHelpers = connHelpers(microsoftSchemas)

export const microsoftDef = {
  name: 'microsoft',
  schemas: microsoftSchemas,
  metadata: {
    displayName: 'microsoft',
    stage: 'beta',
    verticals: ['file-storage'],
    logoUrl: '/_assets/logo-microsoft.svg',
    // @ts-expect-error
    nangoProvider: 'microsoft',
  },
} satisfies ConnectorDef<typeof microsoftSchemas>

export default microsoftDef
