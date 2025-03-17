import {z} from 'zod'
import {ConnectorSchemas, zId} from '@openint/cdk'

export const zOauthConnectorConfig = z
  .object({
    client_id: z.string(),
    client_secret: z.string(),
    scopes: z.array(z.string()).nullish(),
  })
  .describe('Base oauth configuration for the connector')

export const zOAuthConnectionSettings = z.object({
  oauth: z.object({
    credentials: z
      .object({
        access_token: z.string(),
        refresh_token: z.string(),
        expires_at: z.number(),
        client_id: z.string(),
        token_type: z.string(),
        connection_id: z.string(),
        created_at: z.string(),
        updated_at: z.string(),
        last_fetched_at: z.string(),
        provider_config_key: z.string(),
        metadata: z.record(z.unknown()).nullable(),
      })
      .optional()
      .describe('Output of the postConnect hook for oauth2 connectors'),
  }),
})

export const zAuthParamsConfig = z.object({
  authorize: z.record(z.string(), z.string()).optional(),
  token: z.record(z.string(), z.string()).optional(),
  refresh: z.record(z.string(), z.string()).optional(),
  param_names: z
    .object({
      client_id: z.string().optional(),
      client_secret: z.string().optional(),
      scope: z.string().optional(),
      state: z.string().optional(),
      redirect_uri: z.string().optional(),
      code: z.string().optional(),
      access_token: z.string().optional(),
      refresh_token: z.string().optional(),
      expires_in: z.string().optional(),
    })
    .optional(),
})

export const zOAuthConfig = z.object({
  type: z
    .enum(['OAUTH2', 'OAUTH2CC'])
    .describe('The authentication type for OAuth-based providers'),
  authorization_request_url: z
    .string()
    .url()
    .describe('URL to request authorization from the provider'),
  token_request_url: z
    .string()
    .url()
    .describe('URL to obtain an access token from the provider'),
  default_scopes: z
    .array(z.string())
    .optional()
    .describe('Default scopes for the OpenInt platform connector app'),
  scope_separator: z
    .string()
    .default(' ')
    .optional()
    .describe('Separator used to join multiple scopes. Defaults to space.'),

  connector_config: zOauthConnectorConfig.optional(),
  connection_settings: zOAuthConnectionSettings.optional(),
  scopes: z
    .array(
      z.object({
        scope: z
          .string()
          .describe('The scope name as will be passed to the provider'),
        display_name: z
          .string()
          .optional()
          .describe('The display name for end users'),
        description: z.string().describe('Description of what the scope does'),
      }),
    )
    .describe(
      'Possible OAuth scopes for connector with their descriptions and optional display names',
    ),
  params_config: zAuthParamsConfig.optional().default({}),
})

export const oauth2Schemas = {
  connectorConfig: zOauthConnectorConfig,
  connectionSettings: zOAuthConnectionSettings,
  // No pre connect input is necessary for oauth2
  // preConnectInput: z.any(),
  connectInput: z.object({
    authorization_url: z.string(),
  }),
  connectOutput: z.object({
    code: z.string(),
    connectionId: zId['conn'],
    state: z.string(),
  }),
} satisfies Omit<ConnectorSchemas, 'name'>
