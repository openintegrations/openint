import {zCustomerId} from '@openint/cdk'
import {z, zCoerceBoolean} from '@openint/util/zod-utils'
import {zConnectorName} from './connector.models'

export const zConnectOptions = z.object({
  // TODO: expand to https://coda.io/d/_d6fsw71RNUB/Implementing-a-native-UI-for-Connect-via-Core-APIs-and-Deep-Link_susYw00i
  return_url: z.string().optional().openapi({
    title: 'Return URL',
    description: 'The URL to return to after a connection is made',
  }),
  connector_names: z.array(zConnectorName).optional().openapi({
    title: 'Connector Names',
    description: 'The names of the connectors to show in the connect page',
  }),
  view: z.enum(['add', 'manage', 'default']).optional().openapi({
    title: 'Default View to load',
    description:
      'The default view to show when the magic link is opened. Defaults to "add"',
  }),
  debug: zCoerceBoolean().optional().openapi({
    title: 'Debug',
    description: 'Whether to enable debug mode',
  }),
})

export const connectRouterModels = {
  getMagicLinkInput: z.object({
    customer_id: zCustomerId.openapi({
      param: {in: 'path', name: 'customer_id'},
    }),
    validity_in_seconds: z
      .number()
      .optional()
      .default(2592000)
      .describe(
        'How long the magic link will be valid for (in seconds) before it expires',
      ),
    connect_options: zConnectOptions.optional(),
  }),
  createTokenInput: z.object({
    customer_id: zCustomerId.openapi({
      param: {in: 'path', name: 'customer_id'},
    }),
    validity_in_seconds: z.number().optional().default(2592000),
    connect_options: zConnectOptions.optional(),
  }),
}
