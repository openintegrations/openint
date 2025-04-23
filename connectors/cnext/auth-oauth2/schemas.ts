import type {ConnectorSchemas} from '@openint/cdk'
import type {Z} from '@openint/util/zod-utils'

import {z} from '@openint/util/zod-utils'

// MARK: - Connector schemas

const _zOauthConnectorConfig = z
  .object({
    client_id: z.string().nullish(),
    client_secret: z.string().nullish(),
    // TODO: Once we finish database migration, we can remove the preprocess function
    scopes: z.preprocess((val) => {
      if (typeof val === 'string') {
        return val.split(' ')
      }
      return val
    }, z.array(z.string()).nullish()),
    // TODO: Is this needed?
    redirect_uri: z.string().nullish().openapi({
      description: 'Custom redirect URI',
    }),
  })
  .describe('Base oauth configuration for the connector')

export type OAuthConnectorConfig = Z.infer<typeof _zOauthConnectorConfig>

/** To avoid the circular type reference */
export const zOauthConnectorConfig = _zOauthConnectorConfig.openapi({
  'ui:field': 'OAuthField',
})

const zOAuthConnectionSettings = z.object({
  credentials: z
    .object({
      access_token: z.string(),
      // TODO: once we migrate to only cnext connections we can remove the optional on client_id
      client_id: z
        .string()
        .describe('Client ID used for the connection')
        .optional(),
      // This should be really a string or array of strings, probably should be turned into
      // an array
      scope: z.string().optional(),
      refresh_token: z.string().optional(),
      expires_in: z.number().optional(),
      expires_at: z.string().optional(),
      token_type: z.string().optional(),
      // the data returned by the oauth provider in its raw form, currently used to parse the credentials object
      // useful to access domain specific fields such as authed_user in slack https://api.slack.com/methods/oauth.v2.access#examples
      raw: z.record(z.unknown()).optional(),
    })
    .optional()
    .describe('Output of the postConnect hook for oauth2 connectors'),
  /** @deprecated */
  created_at: z.string().optional(),
  /** @deprecated */
  updated_at: z.string().optional(),
  /** @deprecated */
  last_fetched_at: z.string().optional(),
  /** @deprecated */
  metadata: z.record(z.unknown()).nullable().optional(),
})

export type OAuthConnectionSettings = Z.infer<typeof zOAuthConnectionSettings>

export const oauth2Schemas = {
  connector_config: z.object({
    // If null, means to use default config
    oauth: zOauthConnectorConfig.nullish(),
  }),

  connection_settings: z.object({
    oauth: zOAuthConnectionSettings,
  }),
  // No pre connect input is necessary for oauth2
  // TODO: Fix to be unnecessary
  pre_connect_input: z.object({
    /** @deprecated. This is part of the connectContext, not pre-connect input */
    connection_id: z
      .string()
      .optional()
      .describe('In case of re-connecting, id of the existing connection'),
  }),
  connect_input: z.object({
    code_verifier: z.string().optional().describe('Code verifier for PKCE'),
    authorization_url: z.string().describe('URL to take user to for approval'),
  }),
  connect_output: z.object({
    code_verifier: z
      .string()
      .optional()
      .describe('Code verifier for PKCE from the connect input'),
    code: z
      .string()
      .describe('OAuth2 authorization code used for token exchange'),
    state: z.string().describe('OAuth2 state'),
  }),
} satisfies Omit<ConnectorSchemas, 'name'>

// State gets encoded into this. We should consider adding a zod transform from connect_output.state
// but make sure it has an effectType on it
export const zOauthState = z.object({
  connection_id: z.string(),
  redirect_uri: z.string().optional(),
})

export const zOauthCallbackSearchParams = z.object({
  code: z.string(),
  state: z.string(),
})

// MARK; - JSON Def schemas

export const zAuthParamsConfig = z.object({
  authorize: z.record(z.string(), z.string()).optional(),
  token: z.record(z.string(), z.string()).optional(),
  refresh: z.record(z.string(), z.string()).optional(),
  introspect: z.record(z.string(), z.string()).optional(),
  revoke: z.record(z.string(), z.string()).optional(),
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
  code_challenge_method: z
    .enum(['S256', 'plain'])
    .optional()
    .describe('The method to use for PKCE code challenge'),
  authorization_request_url: z
    .string()
    .url()
    .describe('URL to request authorization from the provider'),
  token_request_url: z
    .string()
    .url()
    .describe('URL to obtain an access token from the provider'),
  introspection_request_url: z
    .string()
    .url()
    .optional()
    .describe('URL to introspect an access token from the provider'),
  revocation_request_url: z
    .string()
    .url()
    .optional()
    .describe('URL to revoke an access token from the provider'),
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
