import type {ConnectorDef, ConnectorSchemas} from '@openint/cdk'

import {connHelpers} from '@openint/cdk'
import {z} from '@openint/util/zod-utils'
import {zConfig} from './mootaClient'

export const mootaSchemas = {
  name: z.literal('moota'),
  connector_config: zConfig,
} satisfies ConnectorSchemas

export const mootaHelpers = connHelpers(mootaSchemas)

export const mootaDef = {
  name: 'moota',
  schemas: mootaSchemas,
  metadata: {verticals: ['banking'], logoUrl: '/_assets/logo-moota.svg'},
} satisfies ConnectorDef<typeof mootaSchemas>

export default mootaDef
