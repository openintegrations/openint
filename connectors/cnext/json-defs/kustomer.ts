import type {JsonConnectorDef} from '../schema'
import {z} from '@openint/util/zod-utils'

export const jsonDef = {
  audience: ['business'],
  verticals: ['crm'],
  display_name: 'Kustomer',
  stage: 'ga',
  version: 1,
  auth: {
    type: 'API_KEY',

    openint_scopes: [],
    scopes: [],
    connection_settings: z.object({
      extension: z
        .string()
        .regex(/https:\/\/([a-z0-9_-]+)\.kustomerapp\.com/)
        .describe(
          'The subdomain of your Kustomer account (e.g., https://domain.kustomerapp.com)',
        ),
    }),
  },
} satisfies JsonConnectorDef
