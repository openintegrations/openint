import type {JsonConnectorDef} from '../schema'
import {z} from '@openint/util/zod-utils'

export const jsonDef = {
  audience: ['business'],
  verticals: ['communication', 'streaming'],
  display_name: 'Gong (Oauth)',
  stage: 'ga',
  version: 1,
  auth: {
    type: 'OAUTH2',
    authorization_request_url: 'https://app.gong.io/oauth2/authorize',
    token_request_url: 'https://app.gong.io/oauth2/generate-customer-token',
    scope_separator: ' ',
    params_config: {
      authorize: {response_type: 'code', access_type: 'offline'},
      token: {grant_type: 'authorization_code'},
    },
    openint_scopes: ['user:read'],
    scopes: [
      {
        scope: 'user:read',
        description:
          'Allows read-only access to basic user profile information',
      },
      {
        scope: 'calls:read',
        description: 'Provides access to read call recordings and metadata',
      },
      {
        scope: 'analytics:read',
        description: 'Grants permission to view analytics and reporting data',
      },
      {
        scope: 'admin:write',
        description:
          'Provides full administrative access including user management and system settings',
      },
      {
        scope: 'conversations:full',
        description:
          'Grants complete read/write access to all conversation data including recordings, transcripts, and comments',
      },
    ],
    connection_settings: z.object({
      api_base_url_for_customer: z
        .string()
        .regex(/https?:\/\/.*/)
        .describe('The base URL of your Gong account (e.g., example)'),
    }),
  },
} satisfies JsonConnectorDef
