import type {ConnectorDef, ConnectorSchemas} from '@openint/cdk'
import {connHelpers, oauthBaseSchema} from '@openint/cdk'
import {z} from '@openint/util/zod-utils'

export const zConfig = oauthBaseSchema.connector_config

const oReso = oauthBaseSchema.connection_settings
export const zSettings = oReso.extend({
  oauth: oReso.shape.oauth,
  client_id: z.string().optional(),
})

export const microsoftSchemas = {
  name: z.literal('microsoft'),
  connector_config: z.object({
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
      outlook: z
        .object({
          enabled: z.boolean().optional(),
          scopes: z
            .string()
            .optional()
            .describe('outlook specific space separated scopes'),
        })
        .optional(),
      teams: z
        .object({
          enabled: z.boolean().optional(),
          scopes: z
            .string()
            .optional()
            // User.Read, Team.ReadBasic.All, Team.Read.All, Channel.ReadBasic.All, Channel.Read.All, Chat.Read, Chat.ReadWrite, ChatMessage.Read,
            // ChatMessage.Send, Presence.Read, User.ReadBasic.All, Calls.AccessMedia.All
            .describe('teams specific space separated scopes'),
        })
        .optional(),
    }),
  }),
  connection_settings: zSettings,
  connect_output: oauthBaseSchema.connect_output,
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
    nangoProvider: 'microsoft',
  },
} satisfies ConnectorDef<typeof microsoftSchemas>

export default microsoftDef
