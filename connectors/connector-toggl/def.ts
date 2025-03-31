import type {ConnectorDef, ConnectorSchemas} from '@openint/cdk'
import {connHelpers} from '@openint/cdk'
import {z} from '@openint/util'

export const togglSchemas = {
  name: z.literal('toggl'),
  // connectorConfig: zTogglConfig,
  connectInput: z.object({
    apiToken: z.string(),
  }),
  connectOutput: z.object({
    apiToken: z.string(),
    email: z.string().nullish(),
    password: z.string().nullish(),
  }),
  connectionSettings: z.object({
    apiToken: z.string(),
    email: z.string().nullish(),
    password: z.string().nullish(),
  }),
} satisfies ConnectorSchemas

export const togglHelpers = connHelpers(togglSchemas)

export const togglDef = {
  name: 'toggl',
  metadata: {
    logoUrl: '/_assets/logo-toggl.svg',
  },
  schemas: togglSchemas,
} satisfies ConnectorDef<typeof togglSchemas>

export default togglDef
