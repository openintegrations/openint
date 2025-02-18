import {z} from 'zod'
import {zVerticalKey} from '../../kits/cdk'

const zConnectorConfig = z
  .object({
    client_id: z.string(),
    client_secret: z.string(),
    scopes: z.array(z.string()).nullish(),
  })
  .describe('Base oauth configuration for the connector')

export const zAuthParams = z.object({
  authorize: z.record(z.string(), z.string()).optional(),
  token: z.record(z.string(), z.string()).optional(),
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

export type AuthParams = z.infer<typeof zAuthParams>

export const zOAuthConnectorDef = z.object({
  auth_type: z
    .enum(['OAUTH1', 'OAUTH2', 'OAUTH2CC'])
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
        .args(
          z.object({
            authorization_request_url: z.string().url(),
            auth_params: zAuthParams,
            connector_config: zConnectorConfig,
            redirect_uri: z.string(),
          }),
        )
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
        .args(
          z.object({
            auth_params: zAuthParams,
            connector_config: zConnectorConfig,
            code: z.string(),
            state: z.string(),
            token_request_url: z.string().url(),
            redirect_uri: z.string(),
          }),
        )
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
    // TODO: figure out how to make this optional and default
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

export const zConnectorDef = z
  .object({
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
    vertical: zVerticalKey.describe(
      'The industry vertical this provider belongs to',
    ),
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
