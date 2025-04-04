import {Z, z} from '@openint/util/zod-utils'
import meta from './meta'

export const zConnectorName = z
  .enum(Object.keys(meta) as [keyof typeof meta])
  .openapi({ref: 'core.connector.name'})

export type ConnectorName = Z.infer<typeof zConnectorName>
