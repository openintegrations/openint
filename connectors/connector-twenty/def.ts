import type {ConnectorDef, ConnectorSchemas} from '@openint/cdk'
import {connHelpers} from '@openint/cdk'
import {z} from '@openint/util/zod-utils'

export const twentySchemas = {
  name: z.literal('twenty'),
  connection_settings: z.object({
    access_token: z.string(),
  }),
} satisfies ConnectorSchemas

export const helpers = connHelpers(twentySchemas)

export const twentyDef = {
  metadata: {
    verticals: ['crm'],
    logoUrl: '/_assets/logo-twenty.svg',
    stage: 'beta',
  },
  name: 'twenty',
  schemas: twentySchemas,
} satisfies ConnectorDef<typeof twentySchemas>

export default twentyDef
