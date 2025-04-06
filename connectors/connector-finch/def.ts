import finchOas from '@opensdks/sdk-finch/finch.oas.json'
import type {ConnectorDef, ConnectorSchemas, OpenApiSpec} from '@openint/cdk'
import {connHelpers} from '@openint/cdk'
import {z} from '@openint/util/zod-utils'

const zProduct = z.enum([
  'company',
  'directory',
  'individual',
  'ssn',
  'employment',
  'payment',
  'pay_statement',
  'benefits',
])

export const finchSchemas = {
  name: z.literal('finch'),
  // Auth
  connector_config: z.object({
    client_id: z.string(),
    client_secret: z.string(),
    api_version: z.string().optional().describe('Finch API version'),
    products: z
      .array(zProduct)
      .describe(
        'Finch products to access, @see https://developer.tryfinch.com/api-reference/development-guides/Permissions',
      ),
  }),
  connection_settings: z.object({
    access_token: z.string(),
  }),

  // Connect
  pre_connect_input: z.object({
    // categories: z.array(zCategory),
    // customer_email_address: z.string().optional(),
    // customer_organization_name: z.string().optional(),
    state: z.string().optional(),
  }),
  connect_input: z.object({
    client_id: z.string(),
    products: z.array(zProduct),
  }),
  connect_output: z.object({
    state: z.string().optional(),
    code: z.string(),
  }),
} satisfies ConnectorSchemas

export const helpers = connHelpers(finchSchemas)

export const finchDef = {
  metadata: {
    verticals: ['payroll'],
    logoUrl: '/_assets/logo-finch.svg',
    stage: 'beta',
    // TODO: Make the openAPI spec dynamic.. It can be many megabytes per connector
    // among other things...
    openapiSpec: {
      proxied: finchOas as OpenApiSpec,
    },
  },
  name: 'finch',
  schemas: finchSchemas,
} satisfies ConnectorDef<typeof finchSchemas>

export default finchDef
