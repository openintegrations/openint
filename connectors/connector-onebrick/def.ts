import type {ConnectorDef, ConnectorSchemas} from '@openint/cdk'
import {connHelpers, zWebhookInput} from '@openint/cdk'
import {z} from '@openint/util/zod-utils'
import {zOneBrickConfig} from './OneBrickClient'

const connectInputSchema = z.object({
  publicToken: z.string().nullish(),
  redirect_url: z.string().nullish(),
})

export const onebrickSchemas = {
  name: z.literal('onebrick'),
  connector_config: zOneBrickConfig,
  connection_settings: z.object({accessToken: z.string()}),
  connect_input: connectInputSchema,
  connect_output: z.object({
    publicToken: z.string(),
  }),
  webhook_input: zWebhookInput,
} satisfies ConnectorSchemas

export const helpers = connHelpers(onebrickSchemas)

export const oneBrickDef = {
  name: 'onebrick',
  schemas: onebrickSchemas,
  metadata: {verticals: ['banking'], logoUrl: '/_assets/logo-onebrick.svg'},
} satisfies ConnectorDef<typeof onebrickSchemas>

export default oneBrickDef
