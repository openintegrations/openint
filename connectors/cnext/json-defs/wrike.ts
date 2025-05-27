import type {JsonConnectorDef} from '../schema'

import {z} from '@openint/util/zod-utils'

export default {
  audience: ['business'],
  verticals: ['other'],
  display_name: 'Wrike',
  stage: 'alpha',
  version: 1,
  auth: {
    type: 'OAUTH2',
    authorization_request_url: 'https://login.wrike.com/oauth2/authorize/v4',
    token_request_url: 'https://login.wrike.com/oauth2/token',
    scope_separator: ',',
    params_config: {
      authorize: {response_type: 'code'},
      token: {grant_type: 'authorization_code'},
    },
    openint_default_scopes: ['offline', 'openid'],
    openint_allowed_scopes: ['offline', 'openid', 'wsReadOnly'],
    scopes: [
      {
        scope: 'wsReadOnly',
        description:
          'Read-only access to all data in your Wrike account (tasks, folders, projects, etc.) but cannot make any changes.',
      },
      {
        scope: 'wsReadWrite',
        description:
          'Read and write access to all data in your Wrike account (create, update, delete tasks, folders, etc.).',
      },
      {
        scope: 'amReadOnly',
        description:
          'Read-only access to account management data (users, groups, etc.).',
      },
      {
        scope: 'amReadWrite',
        description:
          'Read and write access to account management data (users, groups, etc.).',
      },
      {
        scope: 'offline',
        description:
          'Allows the application to refresh access tokens when the user is not present. Required for background operations.',
      },
      {
        scope: 'openid',
        description:
          'Required for OpenID Connect authentication flows to identify users.',
      },
    ],
    connection_settings: z.object({
      host: z
        .string()
        .regex(/https:\/\/([a-z0-9_-]+)/)
        .describe(
          'The domain of your Wrike account (e.g., https://example-subdomain)',
        ),
    }),
  },
} satisfies JsonConnectorDef
