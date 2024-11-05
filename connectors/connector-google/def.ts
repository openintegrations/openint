import type {ConnectorDef, ConnectorSchemas} from '@openint/cdk'
import {connHelpers, oauthBaseSchema} from '@openint/cdk'
import {z} from '@openint/util'

export const zConfig = oauthBaseSchema.connectorConfig

const oReso = oauthBaseSchema.resourceSettings
export const zSettings = oReso.extend({
  oauth: oReso.shape.oauth,
})

export const googleSchemas = {
  name: z.literal('google'),
  connectorConfig: z
    .object({
      oauth: z.object({
        client_id: z.string(),
        client_secret: z.string(),
        scopes: z.string().optional().describe('comma separated scopes'),
      }),
      integrations: z.object({
        drive: z.object({
          enabled: z.boolean().optional(),
          scopes: z.string().optional().describe('drive specific scopes'),
        }),
        gmail: z.object({
          enabled: z.boolean().optional(),
          scopes: z.string().optional().describe('gmail specific scopes'),
        }),
        calendar: z.object({
          enabled: z.boolean().optional(),
          scopes: z.string().optional().describe('calendar specific scopes'),
        }),
      }),
    })
    .refine(
      (data) => {
        const {oauth, integrations} = data
        const atLeastOneEnabled = Object.values(integrations).some(
          (integration) => integration.enabled === true,
        )
        const validScopes = Object.values(integrations).every((integration) => {
          if (integration.enabled === true) {
            return oauth.scopes || integration.scopes
          }
          return true
        })
        return atLeastOneEnabled && validScopes
      },
      {
        message:
          'At least one integration must be enabled, and either the global scopes or the integration specific scopes must be set for each enabled integration.',
      },
    ),
  resourceSettings: zSettings,
  connectOutput: oauthBaseSchema.connectOutput,
} satisfies ConnectorSchemas

export const googleHelpers = connHelpers(googleSchemas)

export const googleDef = {
  name: 'google',
  schemas: googleSchemas,
  metadata: {
    displayName: 'google',
    stage: 'beta',
    verticals: ['file-storage', 'calendar'],
    logoUrl: '/_assets/logo-google.svg',
    nangoProvider: 'google',
  },
} satisfies ConnectorDef<typeof googleSchemas>

export default googleDef
