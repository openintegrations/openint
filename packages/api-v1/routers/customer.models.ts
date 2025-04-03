import {zCustomerId} from '@openint/cdk'
import {z, zCoerceBoolean} from '@openint/util/zod-utils'

export const connectClientOptions = z
  .object({
    connector_name: z
      .enum(['plaid', 'greenhouse'])
      .optional()
      .describe(
        'The name of the connector to limit connection to. Default to all otherwise',
      ),
    view: z
      .enum(['add', 'manage'])
      .optional()
      .openapi({
        title: 'Default View to load',
        description:
          'The default view to show when the magic link is opened. Defaults to "add"',
      })
      .default('add'),
    debug: zCoerceBoolean().optional().openapi({
      title: 'Debug',
      description: 'Whether to enable debug mode',
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
    client_options: connectClientOptions.optional(),
  }),
}
