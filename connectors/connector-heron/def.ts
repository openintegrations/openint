import type {ConnectorDef, ConnectorSchemas} from '@openint/cdk'

import {connHelpers} from '@openint/cdk'
import {z} from '@openint/util/zod-utils'

export const heronSchemas = {
  name: z.literal('heron'),
  connector_config: z.object({apiKey: z.string()}),
  // is customerId actually needed here?
  // How do we create default connections for integrations that are basically single connection?
} satisfies ConnectorSchemas

export const helpers = connHelpers(heronSchemas)

export const heronDef = {
  schemas: heronSchemas,
  name: 'heron',
  metadata: {
    displayName: 'Heron Data',
    stage: 'beta',
    verticals: ['enrichment'],
    // This reaches into the next.js public folder which is technically outside the integration directory itself.
    // Low priority to figure out how to have the svg assets be self-contained also
    // also we may need mdx support for the description etc.
    logoUrl: '/_assets/logo-heron.svg',
  },

  standardMappers: {
    connection() {
      return {
        displayName: 'Heron',
        // status: healthy vs. disconnected...
        // labels: test vs. production
      }
    },
  },
} satisfies ConnectorDef<typeof heronSchemas>

export default heronDef
