/** Used for the side effect of window.MergeLink */

import type {Oas, Oas_accounting} from '@opensdks/sdk-merge'
import type {ConnectorDef, ConnectorSchemas, Pta} from '@openint/cdk'
import {connHelpers} from '@openint/cdk'
import {z, zCast} from '@openint/util'

type components = Oas_accounting['components']

type Integration = Oas['components']['schemas']['integration']
type Category = Oas['components']['schemas']['category']

export const mergeSchemas = {
  name: z.literal('merge'),
  connectorConfig: z.object({
    apiKey: z.string(),
  }),

  integrationData: zCast<Integration>(),
  connectionSettings: z.object({
    accountToken: z.string(),
    accountDetails: zCast<components['schemas']['AccountDetails']>().optional(),
  }),
  preConnectInput: z.object({
    // TODO: Use proper openapi spec rather than just a runtime type...
    categories: z.array(zCast<Category>()),
    customer_email_address: z.string().optional(),
    customer_organization_name: z.string().optional(),
  }),
  connectInput: z.object({
    link_token: z.string(),
  }),
  connectOutput: z.union([
    z.object({publicToken: z.string()}),
    // Perfect example why this should be called postConnectInput
    // Can only be provided via CLI...
    // could this possibly eliminate the need for checkResource?
    z.object({accountToken: z.string()}),
  ]),
  sourceOutputEntity: z.discriminatedUnion('entityName', [
    z.object({
      id: z.string(),
      entityName: z.literal('account'),
      entity: zCast<components['schemas']['Account']>(),
    }),
    z.object({
      id: z.string(),
      entityName: z.literal('transaction'),
      entity: zCast<components['schemas']['Transaction']>(),
    }),
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
    entity: {
      account: (entity) => ({
        id: entity.id,
        entityName: 'account',
        entity: {name: entity.entity.name ?? ''},
      }),
      transaction: (entity) => ({
        id: entity.id,
        entityName: 'transaction',
        entity: {
          date: entity.entity.transaction_date ?? '',
          description: entity.entity.line_items?.[0]?.memo ?? '',
        } satisfies Pta.Transaction,
      }),
    },
  },
} satisfies ConnectorDef<typeof mergeSchemas>

export default mergeDef
