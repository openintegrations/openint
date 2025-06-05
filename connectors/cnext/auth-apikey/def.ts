import {z} from '@openint/util/zod-utils'

export const zAPIKeyConnectorDef = z.object({
  type: z
    .literal('API_KEY')
    .describe('The authentication type for API Key-based providers'),
  base_url: z.string().url().describe('The base URL of the API'),
  verification: z.object({
    method: z
      .enum(['GET', 'POST'])
      .describe('The method to verify the API key'),
    api_key_location: z
      .enum(['header_bearer', 'header_basic_password'])
      .describe('The header to verify the API key'),
    endpoint: z.string().describe('The endpoint to verify the API key'),
  }),
  connector_config: z
    .object({})
    .optional()
    .default({})
    .describe('Additional configuration for the api key connector config'),
  connection_settings: z
    .object({})
    .optional()
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
