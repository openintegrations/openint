// import type {Oas_crm_contacts} from '@opensdks/sdk-hubspot/types'
import type {ConnectorDef, ConnectorSchemas} from '@openint/cdk'
import {connHelpers, oauthBaseSchema} from '@openint/cdk'
import {R, z} from '@openint/util'

export const zConfig = oauthBaseSchema.connectorConfig

const oReso = oauthBaseSchema.connectionSettings
export const zSettings = oReso.extend({
  oauth: oReso.shape.oauth,
  extra: z.unknown(),
})

// export type hubspotContact =
//   Oas_crm_contacts['components']['schemas']['CollectionResponseSimplePublicObjectWithAssociationsForwardPaging']['results']

export const HUBSPOT_ENTITIES = ['contact'] as const

export const hubspotSchemas = {
  name: z.literal('hubspot'),
  connectorConfig: zConfig,
  // TODO: Replace nango with our own oauth handling to support platform credentials via env vars easily
  // z.object({
  //   oauth: z.union([
  //     z.null().openapi({title: 'Use OpenInt platform credentials'}),
  //     zConfig.shape.oauth.openapi({title: 'Use my own'}),
  //   ]),
  // }),
  sourceState: z.object({
    contactSyncCursor: z.string().nullish(),
  }),
  connectionSettings: zSettings,
  connectOutput: oauthBaseSchema.connectOutput,
  sourceOutputEntity: z.discriminatedUnion('entityName', [
    z.object({
      id: z.string(),
      entityName: z.literal('contact'),
      entity: z.unknown(),
    }),
  ]),
  sourceOutputEntities: R.mapToObj(HUBSPOT_ENTITIES, (k) => [k, z.unknown()]),
  // Temp hack... As unkonwn causes type error during sourceSync, also need .type object
  // otherwise zod-openapi does not like it https://github.com/asteasolutions/zod-to-openapi/issues/196
  destinationState: z.undefined().openapi({type: 'object'}),
} satisfies ConnectorSchemas

export const hubspotHelpers = connHelpers(hubspotSchemas)

export const hubspotDef = {
  name: 'hubspot',
  schemas: hubspotSchemas,
  metadata: {
    displayName: 'Hubspot',
    stage: 'beta',
    verticals: ['crm'],
    logoUrl: '/_assets/logo-hubspot.svg',
    nangoProvider: 'hubspot',
  },
} satisfies ConnectorDef<typeof hubspotSchemas>

export default hubspotDef
