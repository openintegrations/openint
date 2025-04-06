/** Used for the side effect of window.MergeLink */

import type {Oas, Oas_accounting} from '@opensdks/sdk-merge'
import type {ConnectorDef, ConnectorSchemas} from '@openint/cdk'
import {connHelpers} from '@openint/cdk'
import {z, zCast} from '@openint/util/zod-utils'

type components = Oas_accounting['components']

type Integration = Oas['components']['schemas']['integration']
type Category = Oas['components']['schemas']['category']

export const mergeSchemas = {
  name: z.literal('merge'),
  connector_config: z.object({
    apiKey: z.string(),
  }),

  integration_data: zCast<Integration>(),
  connection_settings: z.object({
    accountToken: z.string(),
    accountDetails: zCast<components['schemas']['AccountDetails']>().optional(),
  }),
  pre_connect_input: z.object({
    // TODO: Use proper openapi spec rather than just a runtime type...
    categories: z.array(zCast<Category>()),
    customer_email_address: z.string().optional(),
    customer_organization_name: z.string().optional(),
  }),
  connect_input: z.object({
    link_token: z.string(),
  }),
  connect_output: z.union([
    z.object({publicToken: z.string()}),
    // Perfect example why this should be called postConnectInput
    // Can only be provided via CLI...
    // could this possibly eliminate the need for checkConnection?
    z.object({accountToken: z.string()}),
  ]),
} satisfies ConnectorSchemas

export const helpers = connHelpers(mergeSchemas)

export const mergeDef = {
  schemas: mergeSchemas,
  name: 'merge',
  metadata: {
    displayName: 'merge.dev',
    stage: 'beta',
    logoUrl: '/_assets/logo-merge.svg',
    verticals: ['accounting', 'commerce', 'crm', 'ats'],
  },

  standardMappers: {
    integration: (ins) => ({
      name: ins.name,
      logoUrl: '/_assets/logo-mer.svg',
      envName: undefined,
      verticals: ins.categories.filter(
        (c): c is 'accounting' | 'hris' => c === 'accounting' || c === 'hris',
      ),
    }),
    connection() {
      return {
        displayName: '',
        // status: healthy vs. disconnected...
        // labels: test vs. production
      }
    },
  },
} satisfies ConnectorDef<typeof mergeSchemas>

export default mergeDef
