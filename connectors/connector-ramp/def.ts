import type {ConnectorDef, ConnectorSchemas} from '@openint/cdk'

import {connHelpers, zCcfgAuth} from '@openint/cdk'
import {z} from '@openint/util/zod-utils'

export const rampSchemas = {
  name: z.literal('ramp'),
  connector_config: zCcfgAuth.oauth,
  connection_settings: z.object({
    accessToken: z.string().nullish(),
    startAfterTransactionId: z.string().nullish(),
  }),
  connect_input: z.object({
    accessToken: z.string().nullish(),
  }),
  connect_output: z.object({
    accessToken: z.string().nullish(),
    clientId: z.string().nullish(),
    clientSecret: z.string().nullish(),
  }),
} satisfies ConnectorSchemas

export const rampHelpers = connHelpers(rampSchemas)

export const rampDef = {
  name: 'ramp',
  schemas: rampSchemas,
  metadata: {
    verticals: ['banking', 'expense-management'],
    logoUrl: '/_assets/logo-ramp.svg',
    stage: 'beta',
  },
  standardMappers: {},
} satisfies ConnectorDef<typeof rampSchemas>

export default rampDef
