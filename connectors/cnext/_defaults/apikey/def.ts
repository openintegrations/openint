import {z} from '@openint/util/zod-utils'

export const zAPIKeyConnectorDef = z.object({
  type: z
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
    .describe('Additional configuration for the api key connector config'),
  connection_settings: z
    .object({})
    .optional()
    .default({})
    .describe('Additional configuration for api key connection settings'),
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
