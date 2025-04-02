import {zCustomerId} from '@openint/cdk'
import {z} from '@openint/util/zod-utils'
import {zConnectionId, zConnectorName} from './utils/types'

export const customerRouterModels = {
  createMagicLinkInput: z.object({
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
    redirect_url: z
      .string()
      .optional()
      .describe(
        'Where to send user to after connect / if they press back button',
      ),
    connector_names: z
      .array(zConnectorName.describe(''))
      .optional()
      .default([])
      .describe('Filter integrations by connector names'),
    connection_id: zConnectionId
      .optional()
      .describe('The specific connection id to load'),
    theme: z
      .enum(['light', 'dark'])
      .optional()
      .default('light')
      .describe('Magic Link display theme'),
    view: z
      .enum(['manage', 'manage-deeplink', 'add', 'add-deeplink'])
      .default('add')
      .optional()
      .describe('Magic Link tab view to load in the connect magic link'),
  }),
}
