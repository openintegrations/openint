import {Z, z} from '@openint/util/zod-utils'
import {defConnectors} from './connectors.def'

export const zConnectorName = z
  .enum(Object.keys(defConnectors) as [keyof typeof defConnectors])
  .openapi({ref: 'core.connector.name'})

export type ConnectorName = Z.infer<typeof zConnectorName>
