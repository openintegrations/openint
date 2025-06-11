import type {JsonConnectorDef} from '../schema'

export default {
  audience: ['business'],
  verticals: ['ats'],
  display_name: 'Greenhouse 2',
  stage: 'alpha',
  version: 1,
  auth: {
    type: 'API_KEY',
    base_url: 'https://harvest.greenhouse.io',
    verification: {
      method: 'GET',
      api_key_location: 'header_basic_password',
      endpoint: '/v1/jobs',
    },
  },
} satisfies JsonConnectorDef
