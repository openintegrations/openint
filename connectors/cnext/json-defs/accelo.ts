import type {JsonConnectorDef} from '../schema'

import {z} from '@openint/util/zod-utils'

export default {
  audience: ['business'],
  verticals: ['accounting', 'ticketing'],
  display_name: 'Accelo',
  stage: 'alpha',
  version: 1,
  auth: {
    type: 'OAUTH2',
    authorization_request_url:
      'https://${connection_settings.subdomain}.api.accelo.com/oauth2/v0/authorize',
    token_request_url:
      'https://${connection_settings.subdomain}.api.accelo.com/oauth2/v0/token',
    scope_separator: ',',
    params_config: {
      authorize: {response_type: 'code'},
      token: {grant_type: 'authorization_code'},
    },
    openint_default_scopes: ['openid', 'offline_access'],
    openint_allowed_scopes: ['openid', 'offline_access', 'read_tickets', 'read_companies'],
    scopes: [
      {
        scope: 'openid',
        description:
          'Allows access to basic user profile information (user ID) for authentication purposes',
      },
      {
        scope: 'offline_access',
        description:
          'Allows the application to refresh access tokens when the user is not actively using the application',
      },
      {
        scope: 'read_profile',
        description:
          'Read-only access to basic user profile information (name, email, etc.)',
      },
      {
        scope: 'read_tickets',
        description: 'Read-only access to tickets and associated data',
      },
      {
        scope: 'write_tickets',
        description: 'Create and update tickets and associated data',
      },
      {
        scope: 'read_companies',
        description: 'Read-only access to company/client information',
      },
      {
        scope: 'admin',
        description: 'Full administrative access to all resources and settings',
      },
    ],
    connection_settings: z.object({
      subdomain: z
        .string()
        .regex(/https:\/\/([a-z0-9_-]+)\.api\.accelo\.com/)
        .describe(
          'The subdomain of your Accelo account (e.g., https://domain.api.accelo.com)',
        ),
    }),
  },
} satisfies JsonConnectorDef
