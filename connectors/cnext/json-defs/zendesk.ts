import type {JsonConnectorDef} from '../schema'

import {z} from '@openint/util/zod-utils'

export default {
  audience: ['business'],
  verticals: ['ticketing'],
  display_name: 'Zendesk',
  stage: 'alpha',
  version: 1,
  auth: {
    type: 'OAUTH2',
    authorization_request_url:
      'https://${connection_settings.subdomain}.zendesk.com/oauth/authorizations/new',
    token_request_url:
      'https://${connection_settings.subdomain}.zendesk.com/oauth/tokens',
    scope_separator: ' ',
    params_config: {},
    openint_default_scopes: ['offline_access'],
    openint_allowed_scopes: ['offline_access', 'users:read', 'tickets:read'],
    scopes: [
      {
        scope: 'read',
        description:
          'Allows read-only access to most Zendesk resources (tickets, users, organizations, etc.) but no modifications',
      },
      {
        scope: 'write',
        description:
          'Allows creation and modification of Zendesk resources (tickets, users, etc.) but not deletion',
      },
      {
        scope: 'users:read',
        description: 'Read-only access to user profiles and information',
      },
      {
        scope: 'tickets:read',
        description: 'Read-only access to tickets and their properties',
      },
      {
        scope: 'tickets:write',
        description: 'Create and update tickets (but not delete)',
      },
      {
        scope: 'account:read',
        description: 'Read-only access to account-level information',
      },
      {
        scope: 'offline_access',
        description:
          'Allows obtaining refresh tokens for long-term access when user is not present',
      },
    ],
    connection_settings: z.object({
      subdomain: z
        .string()
        .regex(/https:\/\/([a-z0-9_-]+)\.zendesk\.com/)
        .describe(
          'The subdomain of your Zendesk account (e.g., https://domain.zendesk.com)',
        ),
    }),
  },
} satisfies JsonConnectorDef
