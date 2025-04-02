import {z} from '@openint/util/zod-utils'
import type {ConnectorSchemas, ConnHelpers} from '../connector.types'
import {zId} from '../id.types'

export const zAuthMode = z
  .enum(['OAUTH2', 'OAUTH1', 'BASIC', 'API_KEY'])
  .openapi({ref: 'AuthMode'})

export const zOauthConnectionError = z.object({
  code: z.enum(['refresh_token_external_error']).or(z.string()),
  message: z.string().nullish(),
})

const zOauthCredentials = z.object({
  type: zAuthMode,
  /** For API key auth... */
  api_key: z.string().nullish(),
  access_token: z.string().optional(),
  refresh_token: z.string().optional(),
  // sometimes this is missing from the response
  expires_at: z.string().datetime().optional(),
  raw: z
    .object({
      access_token: z.string(),
      // sometimes this is missing from the response
      expires_in: z.number().optional(),
      expires_at: z.string().datetime().optional(),
      /** Refresh token (Only returned if the REFRESH_TOKEN boolean parameter is set to true and the refresh token is available) */
      refresh_token: z.string().nullish(),
      refresh_token_expires_in: z.number().nullish(),
      token_type: z.string().nullish(), //'bearer',
      scope: z.string().optional(),
    })
    .passthrough(), // This allows additional properties,
})
export const oauthBaseSchema = {
  name: z.literal('__oauth__'), // TODO: This is a noop
  connectorConfig: z.object({
    oauth: z.object({
      client_id: z.string(),
      client_secret: z.string(),
      /** comma delimited scopes with no spaces in between */
      scopes: z.string().optional(),
    }),
  }),
  connectionSettings: z.object({
    // equivalent to nango /v1/connections data.connection object with certain fields removed like id
    oauth: z.object({
      credentials: zOauthCredentials,
      connection_config: z
        .object({
          portalId: z.number().nullish(),
          instance_url: z.string().nullish(),
        })
        .catchall(z.unknown())
        .nullish(),
      metadata: z.record(z.unknown()).nullable(),
    }),
    // TODO: add error fields here or maybe at a higher level to capture when connection needs to be refreshed
    error: zOauthConnectionError.nullish(),
  }),
  connectOutput: z.object({
    providerConfigKey: zId('ccfg'),
    connectionId: zId('conn'),
  }),
} satisfies ConnectorSchemas

export type OauthBaseTypes = ConnHelpers<typeof oauthBaseSchema>['_types']
