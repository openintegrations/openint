import type {ConnectorDef, ConnectorSchemas} from '@openint/cdk'
import {connHelpers} from '@openint/cdk'
import {R, z} from '@openint/util'

export const GREENHOUSE_ENTITY_NAMES = [
  'job', // Opening is on the job itself
  'application',
  'offer',
  'candidate',
  'opening',
] as const

export const greenhouseSchema = {
  name: z.literal('greenhouse'),
  connectionSettings: z.object({apiKey: z.string()}),
  preConnectInput: z.unknown(),
  connectInput: z.unknown(),
  sourceOutputEntities: R.mapToObj(GREENHOUSE_ENTITY_NAMES, (e) => [
    e,
    z.unknown().optional(),
  ]),
  // need better typing...!
  sourceState: z.unknown(),
} satisfies ConnectorSchemas

export const greenhouseHelpers = connHelpers(greenhouseSchema)

export const greenhouseDef = {
  name: 'greenhouse',
  schemas: greenhouseSchema,
  metadata: {
    displayName: 'Greenhouse',
    stage: 'beta',
    verticals: ['ats'],
    logoUrl: '/_assets/logo-greenhouse.svg',
  },
} satisfies ConnectorDef<typeof greenhouseSchema>

export default greenhouseDef
