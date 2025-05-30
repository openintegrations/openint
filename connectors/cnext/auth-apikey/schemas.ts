import type {ConnectorSchemas} from '@openint/cdk'
import type {Z} from '@openint/util/zod-utils'

import {z} from '@openint/util/zod-utils'

const zApiKeyConnectorConfig = z
  .object({})
  .describe('Base oauth configuration for api key connector')

const zApiKeyConnectionSettings = z.object({
  credentials: z
    .object({
      api_key: z.string(),
    })
    .optional()
    .describe('Output of the postConnect hook for oauth2 connectors'),
})

export type ApiKeyConnectorConfig = Z.infer<typeof zApiKeyConnectorConfig>

export const apiKeySchemas = {
  connector_config: z.object({
    oauth: zApiKeyConnectorConfig.nullish(),
  }),
  connection_settings: z
    .object({
      oauth: zApiKeyConnectionSettings,
    })
    .openapi({effectType: 'input'}),
  pre_connect_input: z.object({}),
  connect_input: z.object({}),
  connect_output: z.object({
    api_key: z.string(),
  }),
} satisfies Omit<ConnectorSchemas, 'name'>

export const zApiKeyConfig = z.object({
  type: z
    .enum(['API_KEY'])
    .describe('The authentication type for OAuth-based providers'),
  connector_config: zApiKeyConnectorConfig.optional(),
  connection_settings: zApiKeyConnectionSettings.optional(),
})
