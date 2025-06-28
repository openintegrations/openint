import type {ConnectorDef, ConnectorSchemas} from '@openint/cdk'

import {connHelpers} from '@openint/cdk'
import {z} from '@openint/util/zod-utils'

export const GREENHOUSE_ENTITY_NAMES = [
  'job', // Opening is on the job itself
  'application',
  'offer',
  'candidate',
  'opening',
] as const

export const greenhouseSchema = {
  name: z.literal('greenhouse'),
  connection_settings: z.object({apiKey: z.string()}),
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
