import type {ConnectorDef, ConnectorSchemas} from '@openint/cdk'
import {connHelpers, oauthBaseSchema} from '@openint/cdk'
import {z} from '@openint/util'

export const zConfig = oauthBaseSchema.connectorConfig

const oReso = oauthBaseSchema.connectionSettings
export const zSettings = oReso.extend({
  oauth: oReso.shape.oauth,
  client_id: z.string().optional(),
})

export const googleSchemas = {
  name: z.literal('google'),
  connectorConfig: z.object({
    oauth: z.object({
      client_id: z.string(),
      client_secret: z.string(),
      scopes: z
        .string()
        .optional()
        .describe('global google connector space separated scopes'),
    }),
    integrations: z.object({
      drive: z
        .object({
          enabled: z.boolean().optional(),
          scopes: z
            .string()
            .optional()
            .describe('drive specific space separated scopes'),
        })
        .optional(),
      gmail: z
        .object({
          enabled: z.boolean().optional(),
          scopes: z
            .string()
            .optional()
            .describe('gmail specific space separated scopes'),
        })
        .optional(),
      calendar: z
        .object({
          enabled: z.boolean().optional(),
          scopes: z
            .string()
            .optional()
            .describe('calendar specific space separated scopes'),
        })
        .optional(),
      sheets: z
        .object({
          enabled: z.boolean().optional(),
          scopes: z
            .string()
            .optional()
            .describe('sheets specific space separated scopes'),
        })
        .optional(),
      docs: z
        .object({
          enabled: z.boolean().optional(),
          scopes: z
            .string()
            .optional()
            .describe('docs specific space separated scopes'),
        })
        .optional(),
      slides: z
        .object({
          enabled: z.boolean().optional(),
          scopes: z
            .string()
            .optional()
            .describe('slides specific space separated scopes'),
        })
        .optional(),
    }),
  }),
  // NOTE We don't support refines yet but ideally we should
  // perform combinatorics validations for google
  // .refine(
  //   (data) => {
  //     const {oauth, integrations} = data
  //     const atLeastOneEnabled = Object.values(integrations).some(
  //       (integration) => integration.enabled === true,
  //     )
  //     const validScopes = Object.values(integrations).every((integration) => {
  //       if (integration.enabled === true) {
  //         return oauth.scopes || integration.scopes
  //       }
  //       return true
  //     })
  //     return atLeastOneEnabled && validScopes
  //   },
  //   {
  //     message:
  //       'At least one integration must be enabled, and either the global scopes or the integration specific scopes must be set for each enabled integration.',
  //   },
  // ),
  connectionSettings: zSettings,
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
