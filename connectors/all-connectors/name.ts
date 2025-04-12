import type {Z} from '@openint/util/zod-utils'

import {z} from '@openint/util/zod-utils'
import meta from './connectors.meta'

// Move this to a separate file to reduce amount of import

export const zConnectorName = z
  .enum(Object.keys(meta) as [keyof typeof meta])
  .openapi({ref: 'core.connector.name'})

export type ConnectorName = Z.infer<typeof zConnectorName>
