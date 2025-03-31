import type {ConnectorDef, ConnectorSchemas} from '@openint/cdk'
import {connHelpers} from '@openint/cdk'
import {z, zCast} from '@openint/util'

export const zForeceiptConfig = z.object({
  credentials: zCast<Readonly<Foreceipt.Credentials>>(),
  _id: zCast<ExternalId>(),
  envName: z.enum(['staging', 'production']),
})

// type ForeceiptSyncOperation = typeof def['_opType']
export const foreceiptSchemas = {
  name: z.literal('foreceipt'),
  // connectorConfig: zForeceiptConfig,
  connectionSettings: z.object({
    credentials: zCast<Readonly<Foreceipt.Credentials>>(),
    _id: zCast<ExternalId>(),
    envName: z.enum(['staging', 'production']),
  }),
  connectInput: zForeceiptConfig,
  connectOutput: zForeceiptConfig,
} satisfies ConnectorSchemas

export const foreceiptHelpers = connHelpers(foreceiptSchemas)

export const foreceiptDef = {
  name: 'foreceipt',
  schemas: foreceiptSchemas,
  metadata: {
    verticals: ['expense-management'],
    logoUrl: '/_assets/logo-foreceipt.svg',
  },
} satisfies ConnectorDef<typeof foreceiptSchemas>

export default foreceiptDef
