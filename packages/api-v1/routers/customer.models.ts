import {zCustomerId} from '@openint/cdk'
import {z} from '@openint/util/zod-utils'

export const connectClientOptions = z
  .object({
    connector_name: z
      .enum(['plaid', 'greenhouse'])
      .optional()
      .describe(
        'The name of the connector to limit connection to. Default to all otherwise',
      ),
    tab: z.enum(['my-connections', 'add-connection']).optional().openapi({
      title: 'Default Tab',
      description:
        'The default tab to show when the magic link is opened. Defaults to "my-connections"',
    }),
    '--primary': z.string().optional(),
    '--background': z.string().optional(),
    '--foreground': z.string().optional(),
    '--card': z.string().optional(),
    '--card-foreground': z.string().optional(),
  })
  .openapi({
    description:
      'Search params to configure the connect page. Not signed as part of JWT and therefore can be modified by client',
  })

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
    client_options: connectClientOptions.optional(),
  }),
}
