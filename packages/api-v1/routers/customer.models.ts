import {zCustomerId} from '@openint/cdk'
import {z, zCoerceBoolean} from '@openint/util/zod-utils'
import {zConnectorName} from './connector.models'

export const connectClientOptions = z
  .object({
    view: z
      .enum(['add', 'manage'])
      .optional()
      .openapi({
        title: 'Default View to load',
        description:
          'The default view to show when the magic link is opened. Defaults to "add"',
      })
      .default('add'),
    // NOTE: @openint-bot, shouldn't this be a string array similar to our expand one?
    // then support filtering like https://coda.io/d/_d6fsw71RNUB/Implementing-a-native-UI-for-Connect-via-Core-APIs-and-Deep-Link_susYw00i
    connector_name: zConnectorName
      .optional()
      .describe(
        'The name of the connector to limit connection to. Default to all otherwise',
      ),

    debug: zCoerceBoolean().optional().openapi({
      title: 'Debug',
      description: 'Whether to enable debug mode',
    }),

    // NOTE: @openint-bot, how about we have two theming variables, theme & colors
    // and these we nest under colors? similar to https://github.com/openintegrations/openint/blob/8aa8ad15b420bc4bb2361b3744af7cced5bd5f07/packages/engine-backend/router/customerRouter.ts#L67
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
