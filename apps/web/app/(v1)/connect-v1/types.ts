'use client'

import {extendZodWithOpenApi, z} from '@openint/util'

extendZodWithOpenApi(z)

export const zConnectV1SearchParams = z.object({
  connector_name: z
    .enum(['plaid', 'greenhouse'])
    .optional()
    .describe(
      'The name of the connector configuration to use. Default to all otherwise',
    ),
  tab: z.enum(['my-connections', 'add-connection']).optional().openapi({
    title: 'Default Tab',
    description:
      'The default tab to show when the magic link is opened. Defaults to "my-connections"',
  }),
})

export type ConnectV1SearchParams = z.infer<typeof zConnectV1SearchParams>
