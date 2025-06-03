import type {JsonConnectorDef} from '../schema'

import {z} from '@openint/util/zod-utils'

export default {
  audience: ['business'],
  verticals: ['ats'],
  display_name: 'Greenhouse 2',
  stage: 'alpha',
  version: 1,
  auth: {
    type: 'API_KEY',
    connector_config: {},
    connection_settings: z.object({}),
    base_url: 'https://harvest.greenhouse.io',
    verification: {
      method: 'GET',
      header_mode: 'Basic',
      endpoint: '/v1/jobs',
    },
  },
} satisfies JsonConnectorDef
