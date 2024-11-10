// import type {Oas_crm_contacts} from '@opensdks/sdk-hubspot/types'
import type {ConnectorDef, ConnectorSchemas} from '@openint/cdk'
import {connHelpers, oauthBaseSchema, zEntityPayload} from '@openint/cdk'
import {z} from '@openint/util'

export const zConfig = oauthBaseSchema.connectorConfig

const oReso = oauthBaseSchema.resourceSettings
export const zSettings = oReso.extend({
  oauth: oReso.shape.oauth,
  extra: z.unknown(),
})

// export type hubspotContact =
//   Oas_crm_contacts['components']['schemas']['CollectionResponseSimplePublicObjectWithAssociationsForwardPaging']['results']

export enum HUBSPOT_ENTITIES {
  contact = 'contact',
}
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
  resourceSettings: zSettings,
  connectOutput: oauthBaseSchema.connectOutput,
  sourceOutputEntity: zEntityPayload,
  sourceOutputEntities: Object.fromEntries(
    Object.values(HUBSPOT_ENTITIES).map((entity) => [entity, z.any()]),
  ),
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
