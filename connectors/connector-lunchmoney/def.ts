import type {ConnectorDef, ConnectorSchemas} from '@openint/cdk'
import {connHelpers} from '@openint/cdk'
import {z} from '@openint/util/zod-utils'
import {zConfig} from './lunchmoneyClient'

export const lunchmoneySchemas = {
  name: z.literal('lunchmoney'),
  connector_config: zConfig,
} satisfies ConnectorSchemas

export const lunchmoneyHelpers = connHelpers(lunchmoneySchemas)

export const lunchmoneyDef = {
  name: 'lunchmoney',
  schemas: lunchmoneySchemas,
  metadata: {
    verticals: ['personal-finance'],
    logoUrl: '/_assets/logo-lunchmoney.svg',
  },
} satisfies ConnectorDef<typeof lunchmoneySchemas>

export default lunchmoneyDef
