import oas from '@opensdks/sdk-salesforce/salesforce.oas.json'
import type {ConnectorDef, ConnectorSchemas, OpenApiSpec} from '@openint/cdk'
import {connHelpers, oauthBaseSchema} from '@openint/cdk'
import {R, z} from '@openint/util'

export const zConfig = oauthBaseSchema.connectorConfig

const oReso = oauthBaseSchema.connectionSettings
export const zSettings = oReso.extend({
  oauth: oReso.shape.oauth,
})

export const SALESFORCE_ENTITIES = ['contact'] as const

export const salesforceSchemas = {
  name: z.literal('salesforce'),
  connectorConfig: zConfig,
  connectionSettings: zSettings,
  connectOutput: oauthBaseSchema.connectOutput,
  sourceState: z.object({
    nextRecordsUrl: z.string().nullish(),
  }),
  sourceOutputEntity: z.discriminatedUnion('entityName', [
    z.object({
      id: z.string(),
      entityName: z.literal('contact'),
      entity: z.unknown(),
    }),
  ]),
  sourceOutputEntities: R.mapToObj(SALESFORCE_ENTITIES, (k) => [
    k,
    z.unknown(),
  ]),
} satisfies ConnectorSchemas

export const salesforceHelpers = connHelpers(salesforceSchemas)

export const salesforceDef = {
  name: 'salesforce',
  schemas: salesforceSchemas,
  metadata: {
    displayName: 'salesforce',
    stage: 'beta',
    verticals: ['crm'],
    logoUrl: '/_assets/logo-salesforce.svg',
    nangoProvider: 'salesforce',
    openapiSpec: {proxied: oas as unknown as OpenApiSpec},
  },
} satisfies ConnectorDef<typeof salesforceSchemas>

export default salesforceDef
