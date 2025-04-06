import type {ConnectorDef, ConnectorSchemas} from '@openint/cdk'
import {connHelpers} from '@openint/cdk'
import {z, zCast} from '@openint/util/zod-utils'
import {zConfig} from './saltedgeClient'

export const saltedgeSchemas = {
  name: z.literal('saltedge'),
  connector_config: zConfig,
  connection_settings: zCast<SaltEdge.Connection & {_id: ExternalId}>(),
} satisfies ConnectorSchemas

export const saltedgeHelpers = connHelpers(saltedgeSchemas)

export const saltedgeDef = {
  name: 'saltedge',
  schemas: saltedgeSchemas,
  metadata: {verticals: ['banking'], logoUrl: '/_assets/logo-saltedge.svg'},
} satisfies ConnectorDef<typeof saltedgeSchemas>

export default saltedgeDef
