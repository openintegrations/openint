import {z} from 'zod'
import {zVerticalKey} from '../../kits/cdk'

export const zConnectorConfig = z
  .object({
    client_id: z.string(),
    client_secret: z.string(),
    scopes: z.array(z.string()).nullish(),
  })
  .describe('Base oauth configuration for the connector')

// Base auth params shared across flows
export const zBaseAuthParams = z.object({
  /** Which part of token exchange response to save into config settings */
  capture_response_fields: z.array(z.string()).optional(),
  field_mappings: z
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
  auth_params: zAuthorizeParams,
  connector_config: zConnectorConfig,
  redirect_uri: z.string(),
  connection_id: z.string(),
})

export const zTokenExchangeHandlerArgs = z.object({
  auth_params: zTokenParams,
  connector_config: zConnectorConfig,
  code: z.string(),
  state: z.string(),
  token_request_url: z.string().url(),
  redirect_uri: z.string(),
})

export const zTokenRefreshHandlerArgs = z.object({
  auth_params: zRefreshParams,
  connector_config: zConnectorConfig,
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
  auth_type: z
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
  auth_scope: z
    .union([z.string(), z.array(z.string())])
    .optional()
    .describe('Scopes required for initial authentication'),
  openint_scopes: z
    .array(z.string())
    .optional()
    .describe('Default scopes for the OpenInt platform connector app'),
  auth_scope_separator: z
    .string()
    .default(' ')
    .optional()
    .describe('Separator used to join multiple scopes. Defaults to comma.'),
  connector_config: z.union([zConnectorConfig, z.any()]).default({}),
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
  auth_params: z.union([zAuthParams, z.any()]).optional().default({}),
  handlers: z
    .object({
      authorize: z
        .function()
        .args(zAuthorizeHandlerArgs)
        .returns(
          z.promise(
            z.object({
              authorization_url: z.string().url(),
            }),
          ),
        )
        .optional(),
      token: z
        .function()
        .args(zTokenHandlerArgs)
        .returns(z.promise(z.instanceof(Response)))
        .optional(),
      response: z
        .function()
        .args(
          z.object({
            response: z.record(z.string(), z.unknown()),
            metadata: z.record(z.string(), z.unknown()),
          }),
        )
        .returns(
          z.promise(
            z.object({
              access_token: z.string(),
              refresh_token: z.string().optional(),
              expires_in: z.number().optional(),
              instance_url: z.string().url().optional(),
            }),
          ),
        )
        .optional(),
    })
    .optional()
    .default({}),
})
export const zAPIKeyConnectorDef = z.object({
  auth_type: z
    .literal('API_KEY')
    .describe('The authentication type for API Key-based providers'),
  api_key_field: z
    .string()
    .describe('Field name where the API key should be passed'),
  api_key_location: z
    .enum(['header', 'query'])
    .describe(
      'Specifies whether the API key is passed in headers or query parameters',
    ),
  connector_config: z
    .object({})
    .optional()
    .default({})
    .describe('Additional configuration for the connector'),
  connection_settings: z
    .object({})
    .optional()
    .default({})
    .describe('Output of the postConnect hook'),
  overrides: z
    .object({
      verify: z
        .function()
        .args(z.any())
        .returns(z.any())
        .optional()
        .describe('Custom function to verify API Key authentication'),
    })
    .optional()
    .describe('Custom override functions for API Key authentication'),
})

// the idea is that this is provided by a CMS like payload and
// is searchable based on the connector name
const zlinks = z.object({
  web_url: z.string().url().describe("URL to the provider's website"),
  api_docs_url: z
    .string()
    .url()
    .describe("URL to the provider's API documentation")
    .optional(),
  other: z
    .array(
      z.object({
        description: z.string().describe('Description of the link'),
        url: z.string().url().describe('URL of the link'),
      }),
    )
    .describe('Other links relevant to the connector')
    .optional(),
})

export const zAudience = z
  .enum(['consumer', 'business', 'enterprise'])
  .describe('The target audience of the connector')

export type Audience = z.infer<typeof zAudience>

export const zConnectorDef = z
  .object({
    audience: z.array(zAudience).describe('The audiences of the connector'),
    connector_name: z
      .string()
      .describe('The unique name of the provider in kebab-case'),
    readiness: z
      .enum(['alpha', 'beta', 'ga'])
      .describe('The readiness level of the connector'),
    version: z
      .number()
      .int()
      .min(1)
      .max(20)
      .describe('The version of the connector'),
    display_name: z.string().describe('The display name of the provider'),
    verticals: z
      .array(zVerticalKey)
      .describe('The industry verticals this provider belongs to'),
    pre_connect_input: z.object({}).optional(),
    post_connect_input: z.object({}).optional(),
    post_connect_output: z.object({}).optional(),
    webhook_input: z.object({}).optional(),
    links: zlinks,
  })
  .and(
    z.discriminatedUnion('auth_type', [
      zOAuthConnectorDef,
      zAPIKeyConnectorDef,
    ]),
  )

export type ConnectorDef = z.infer<typeof zConnectorDef>

const zAuthType = z
  .union([
    zOAuthConnectorDef.shape.auth_type,
    zAPIKeyConnectorDef.shape.auth_type,
  ])
  .describe('Union of supported authentication types')

export type AuthType = z.infer<typeof zAuthType>
