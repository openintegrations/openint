import type {ConnectorSchemas} from '@openint/cdk'
import {z} from '@openint/util/zod-utils'

const zOauthConnectorConfig = z
  .object({
    client_id: z.string().nullish(),
    client_secret: z.string().nullish(),
    scopes: z.array(z.string()).nullish(),
    // TODO: Is this needed?
    redirect_uri: z.string().nullish(),
  })
  .describe('Base oauth configuration for the connector')
  .openapi({
    // 'ui:field': 'OAuthField',
  })

const zOAuthConnectionSettings = z.object({
  credentials: z
    .object({
      access_token: z.string(),
      client_id: z.string(),
      scope: z.string(),
      refresh_token: z.string().optional(),
      expires_in: z.number().optional(),
      expires_at: z.string().optional(),
      token_type: z.string().optional(),
      // the data returned by the oauth provider in its raw form, currently used to parse the credentials object
      // useful to access domain specific fields such as authed_user in slack https://api.slack.com/methods/oauth.v2.access#examples
      raw: z.record(z.unknown()),
    })
    .optional()
    .describe('Output of the postConnect hook for oauth2 connectors'),
  created_at: z.string(),
  updated_at: z.string(),
  last_fetched_at: z.string(),
  metadata: z.record(z.unknown()).nullable(),
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
  openint_scopes: z
    .array(z.string())
    .optional()
    .describe('Default scopes for the OpenInt platform connector app'),
  scope_separator: z
    .string()
    .default(' ')
    .optional()
    .describe('Separator used to join multiple scopes. Defaults to space.'),

  connector_config: z.union([zOauthConnectorConfig, z.any()]).optional(),
  connection_settings: z.union([zOAuthConnectionSettings, z.any()]).optional(),
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
  connectorConfig: z.object({
    oauth: zOauthConnectorConfig.nullable(),
  }),

  connectionSettings: z.object({
    oauth: zOAuthConnectionSettings,
  }),
  // No pre connect input is necessary for oauth2
  // TODO: Fix to be unnecessary
  preConnectInput: z.any(),
  connectInput: z.object({
    authorization_url: z.string(),
  }),
  connectOutput: z.object({
    code: z.string(),
    // connectionId: z.string(),
    state: z.string(),
  }),
} satisfies Omit<ConnectorSchemas, 'name'>
