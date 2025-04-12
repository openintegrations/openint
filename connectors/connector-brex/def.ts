import type {ConnectorDef, ConnectorSchemas} from '@openint/cdk'

import {connHelpers, zCcfgAuth} from '@openint/cdk'
import {z} from '@openint/util/zod-utils'

export const brexSchemas = {
  name: z.literal('brex'),
  connector_config: zCcfgAuth.oauthOrApikeyAuth,
  integration_data: z.unknown(),
  connection_settings: z.object({
    accessToken: z.string(),
  }),
} satisfies ConnectorSchemas

export const brexDef = {
  schemas: brexSchemas,
  name: 'brex',
  metadata: {
    verticals: [
      'banking',
      // Add back expense management category once we actually support it properly
      // 'expense-management'
    ],
    logoUrl: '/_assets/logo-brex.svg',
    stage: 'beta',
  },
  standardMappers: {
    integration: () => ({
      name: 'Brex',
      logoUrl: 'Add brex logo...',
      envName: undefined,
      verticals: ['banking'],
    }),
    connection() {
      return {
        displayName: '',
        // status: healthy vs. disconnected...
        // labels: test vs. production
      }
    },
  },
} satisfies ConnectorDef<typeof brexSchemas>

export const helpers = connHelpers(brexSchemas)

export default brexDef
