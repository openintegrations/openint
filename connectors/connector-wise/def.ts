import type {ConnectorDef, ConnectorSchemas} from '@openint/cdk'

import {connHelpers} from '@openint/cdk'
import {z} from '@openint/util/zod-utils'
import {zEnvName} from './WiseClient'

export const wiseSchemas = {
  name: z.literal('wise'),
  // connectorConfig: zWiseConfig,
  connection_settings: z.object({
    envName: zEnvName,
    apiToken: z.string().nullish(),
  }),
  connect_input: z.object({
    redirectUri: z.string(),
    clientId: z.string(),
    envName: zEnvName,
  }),
  connect_output: z.object({
    envName: zEnvName,
    apiToken: z.string().nullish(),
  }),
} satisfies ConnectorSchemas

export const wiseHelpers = connHelpers(wiseSchemas)

export const wiseDef = {
  name: 'wise',
  schemas: wiseSchemas,
  metadata: {verticals: ['banking'], logoUrl: '/_assets/logo-wise.svg'},
} satisfies ConnectorDef<typeof wiseSchemas>

export default wiseDef
