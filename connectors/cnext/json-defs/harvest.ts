import type {JsonConnectorDef} from '../schema'

import {z} from '@openint/util/zod-utils'

export default {
  audience: ['business'],
  verticals: ['other'],
  display_name: 'Harvest',
  stage: 'alpha',
  version: 1,
  auth: {
    type: 'OAUTH2',
    authorization_request_url: 'https://id.getharvest.com/oauth2/authorize',
    token_request_url: 'https://id.getharvest.com/api/v2/oauth2/token',
    scope_separator: ' ',
    params_config: {
      authorize: {response_type: 'code'},
      token: {grant_type: 'authorization_code'},
    },
    openint_default_scopes: ['harvest:default'],
    openint_allowed_scopes: ['harvest:default', 'harvest:me', 'harvest:projects:read'],
    scopes: [
      {
        scope: 'harvest:me',
        description:
          'Read-only access to your personal user information (email, name, etc.)',
      },
      {
        scope: 'harvest:default',
        description:
          'Basic read access to time entries, projects, and clients you have access to',
      },
      {
        scope: 'harvest:time_entries:read',
        description: 'Read access to time entries',
      },
      {
        scope: 'harvest:time_entries:write',
        description: 'Create and update time entries',
      },
      {
        scope: 'harvest:projects:read',
        description: 'Read access to projects',
      },
      {
        scope: 'harvest:projects:write',
        description: 'Create and update projects',
      },
      {
        scope: 'harvest:all',
        description: 'Full access to all endpoints and data',
      },
    ],
    connection_settings: z.object({
      appDetails: z
        .string()
        .describe('The details of your app (e.g., example-subdomain)'),
    }),
  },
} satisfies JsonConnectorDef
