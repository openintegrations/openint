import {z} from 'zod'

// // Define OAuth2 handler types
// export type AuthorizeHandlerArgs = {
//   authorization_request_url: string
//   params: any
//   connector_config: any
//   redirect_uri: string
//   connection_id: string
// }

// export type TokenHandlerArgs = {
//   flow_type: 'exchange' | 'refresh'
//   params: any
//   connector_config: any
//   token_request_url: string
//   redirect_uri?: string
//   code?: string
//   state?: string
//   refresh_token?: string
// }

export type ResponseHandlerArgs = {
  response: Record<string, unknown>
  metadata: Record<string, unknown>
}

export type AuthorizeHandler = (
  args: AuthorizeHandlerArgs,
) => Promise<{authorization_url: string}>
export type TokenHandler = (args: TokenHandlerArgs) => Promise<Response>
export type ResponseHandler = (args: ResponseHandlerArgs) => Promise<{
  access_token: string
  refresh_token?: string
  expires_in?: number
  instance_url?: string
}>

export type OAuth2ServerOverrides = {
  authorize: AuthorizeHandler
  token: TokenHandler
  response: ResponseHandler
}

export const zOauthConnectorConfig = z
  .object({
    client_id: z.string(),
    client_secret: z.string(),
    scopes: z.array(z.string()).nullish(),
  })
  .describe('Base oauth configuration for the connector')

// Base auth params shared across flows
export const zBaseAuthParams = z.object({
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

// Auth params for authorization flow
export const zAuthorizeParams = zBaseAuthParams.extend({
  authorize: z.record(z.string(), z.string()),
})

// Auth params for token exchange flow
export const zTokenParams = zBaseAuthParams.extend({
  token: z.record(z.string(), z.string()),
})

// Auth params for refresh token flow
export const zRefreshParams = zBaseAuthParams.extend({
  refresh: z.record(z.string(), z.string()),
})

// Combined auth params
export const zAuthParams = zBaseAuthParams.extend({
  authorize: z.record(z.string(), z.string()).optional(),
  token: z.record(z.string(), z.string()).optional(),
  refresh: z.record(z.string(), z.string()).optional(),
})

export type AuthParams = z.infer<typeof zAuthParams>
export type AuthorizeParams = z.infer<typeof zAuthorizeParams>
export type TokenParams = z.infer<typeof zTokenParams>
export type RefreshParams = z.infer<typeof zRefreshParams>

// Define strongly typed handler argument types
export const zAuthorizeHandlerArgs = z.object({
  authorization_request_url: z.string().url(),
  params: zAuthorizeParams,
  connector_config: zOauthConnectorConfig,
  redirect_uri: z.string(),
  connection_id: z.string(),
})

export const zTokenExchangeHandlerArgs = z.object({
  params: zTokenParams,
  connector_config: zOauthConnectorConfig,
  code: z.string(),
  state: z.string(),
  token_request_url: z.string().url(),
  redirect_uri: z.string(),
})

export const zTokenRefreshHandlerArgs = z.object({
  params: zRefreshParams,
  connector_config: zOauthConnectorConfig,
  token_request_url: z.string().url(),
  refresh_token: z.string(),
})

// Combined token handler args with discriminated union
export const zTokenHandlerArgs = z.discriminatedUnion('flow_type', [
  zTokenExchangeHandlerArgs.extend({flow_type: z.literal('exchange')}),
  zTokenRefreshHandlerArgs.extend({flow_type: z.literal('refresh')}),
])

export type AuthorizeHandlerArgs = z.infer<typeof zAuthorizeHandlerArgs>
export type TokenExchangeHandlerArgs = z.infer<typeof zTokenExchangeHandlerArgs>
export type TokenRefreshHandlerArgs = z.infer<typeof zTokenRefreshHandlerArgs>
export type TokenHandlerArgs = z.infer<typeof zTokenHandlerArgs>

export const zOAuthConnectorDef = z.object({
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
  scope: z
    .union([z.string(), z.array(z.string())])
    .optional()
    .describe('Scopes required for initial authentication'),
  openint_scopes: z
    .array(z.string())
    .optional()
    .describe('Default scopes for the OpenInt platform connector app'),
  scope_separator: z
    .string()
    .default(' ')
    .optional()
    .describe('Separator used to join multiple scopes. Defaults to comma.'),
  // TODO: review that it extends the schema of the json connector
  connector_config: z.union([zOauthConnectorConfig, z.any()]).default({}),
  // TODO: review that it extends the schema of the json connector
  connection_settings: z
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
    .describe('Output of the postConnect hook'),
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
  params: z.union([zAuthParams, z.any()]).optional().default({}),
})
