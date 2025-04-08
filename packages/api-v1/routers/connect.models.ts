import {zConnectOptions, zCustomerId} from '@openint/cdk'
import {z} from '@openint/util/zod-utils'

export {zConnectOptions}

export const connectRouterModels = {
  getMagicLinkInput: z.object({
    customer_id: zCustomerId.openapi({
      param: {in: 'path', name: 'customer_id'},
      description: 'The unique ID of the customer to create the magic link for',
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
      description: 'The unique ID of the customer to create the token for',
    }),
    validity_in_seconds: z.number().optional().default(2592000),
    connect_options: zConnectOptions.optional(),
  }),
}
