import type {ConnectorDef, ConnectorSchemas} from '@openint/cdk'
import {connHelpers, zId} from '@openint/cdk'
import {z} from '@openint/util'

export const aircallSchema = {
  name: z.literal('aircall'),
  connectionSettings: z.object({apiId: z.string(), apiToken: z.string()}),
  connectOutput: z.object({
    providerConfigKey: zId('ccfg'),
    connectionId: zId('conn'),
  }),
} satisfies ConnectorSchemas

export const aircallHelpers = connHelpers(aircallSchema)

export const aircallDef = {
  name: 'aircall',
  schemas: aircallSchema,
  metadata: {
    displayName: 'Aircall',
    stage: 'beta',
    verticals: ['communication'],
    logoUrl: '/_assets/logo-aircall.svg',
  },
} satisfies ConnectorDef<typeof aircallSchema>

export default aircallDef
