import type {ConnectorDef, ConnectorSchemas} from '@openint/cdk'
import {connHelpers} from '@openint/cdk'
import {z, zCast} from '@openint/util/zod-utils'

export const zConfig = z.object({
  v1BaseURL: z.string().nullish(),
  v5BaseURL: z.string().nullish(),
  proxy: z.object({url: z.string(), cert: z.string()}).nullish(),
})

export const zCreds = z.object({
  cookie: z.string().nullish(),
  accessToken: z.string().nullish(),
})

const zSettings = z.object({
  me: zCast<Venmo.GetCurrentUserData>(),
  // TODO: Store venmo credentials inside VGS rather than own db
  credentials: zCast<Venmo.Credentials>(),
})

export const venmoSchemas = {
  name: z.literal('venmo'),
  connector_config: zConfig,
  connection_settings: zSettings,
} satisfies ConnectorSchemas

export const helpers = connHelpers(venmoSchemas)

export const venmoDef = {
  name: 'venmo',
  schemas: venmoSchemas,
  metadata: {verticals: ['banking'], logoUrl: '/_assets/logo-venmo.svg'},
} satisfies ConnectorDef<typeof venmoSchemas>

export default venmoDef
