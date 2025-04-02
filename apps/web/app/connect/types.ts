'use client'

import {z, type Z} from '@openint/util/zod-utils'

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

  debug: z.boolean().optional(),

  // TODO: Figure out why '--primary' does not show up in schema form... without debug above

  '--primary': z.string().optional(),
  '--background': z.string().optional(),
  '--foreground': z.string().optional(),
  // '--card': z.string().optional(),
  // '--card-foreground': z.string().optional(),
})

export type ConnectV1SearchParams = Z.infer<typeof zConnectV1SearchParams>
