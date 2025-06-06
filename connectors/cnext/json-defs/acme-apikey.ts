import type {JsonConnectorDef} from '../schema'

import {z} from '@openint/util/zod-utils'

export default {
  audience: ['consumer'],
  verticals: ['social-media'],
  display_name: 'Acme API Key',
  stage: 'ga',
  version: 1,
  auth: {
    type: 'API_KEY',
    connector_config: {},
    connection_settings: z.object({}),
    base_url: '{{baseURLs.api}}',
    verification: {
      method: 'GET',
      api_key_location: 'header_basic_password',
      endpoint: '/acme-apikey/authorize',
    },
  },
} satisfies JsonConnectorDef
