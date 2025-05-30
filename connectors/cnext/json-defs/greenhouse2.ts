import type {JsonConnectorDef} from '../schema'

import {z} from '@openint/util/zod-utils'

export default {
  audience: ['business'],
  verticals: ['ats'],
  display_name: 'Greenhouse 2',
  stage: 'ga',
  version: 1,
  auth: {
    type: 'API_KEY',
    connector_config: {},
    api_key_field: 'api_key',
    api_key_location: 'header',
    connection_settings: z.object({api_key: z.string()}),
  },
} satisfies JsonConnectorDef
