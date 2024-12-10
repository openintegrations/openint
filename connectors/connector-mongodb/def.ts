import type {
  AnyEntityPayload,
  ConnectorDef,
  ConnectorSchemas,
} from '@openint/cdk'
import {z, zCast} from '@openint/util'

export const zMongoConnection = z.object({
  databaseUrl: z.string(),
  databaseName: z.string(),
})

export const mongoSchemas = {
  name: z.literal('mongodb'),
  connectionSettings: zMongoConnection,
  destinationInputEntity: zCast<AnyEntityPayload>(),
} satisfies ConnectorSchemas

export const mongoDef = {
  name: 'mongodb',
  schemas: mongoSchemas,
  metadata: {verticals: ['database'], logoUrl: '/_assets/logo-mongodb.svg'},
} satisfies ConnectorDef<typeof mongoSchemas>

export default mongoDef
