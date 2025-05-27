import type {JsonConnectorDef} from '../schema'

import {z} from '@openint/util/zod-utils'

export default {
  audience: ['business'],
  verticals: ['other'],
  display_name: 'Basecamp',
  stage: 'alpha',
  version: 1,
  auth: {
    type: 'OAUTH2',
    authorization_request_url:
      'https://launchpad.37signals.com/authorization/new',
    token_request_url: 'https://launchpad.37signals.com/authorization/token',
    scope_separator: ' ',
    params_config: {
      authorize: {type: 'web_server'},
      token: {type: 'web_server'},
    },
    openint_default_scopes: ['account', 'projects:read'],
    openint_allowed_scopes: ['account', 'profile', 'projects:read'],
    scopes: [
      {
        scope: 'profile',
        description:
          'Read-only access to basic user profile information (name, email, avatar, timezone)',
      },
      {
        scope: 'projects',
        description:
          'Read-only access to projects and their metadata (no access to project contents)',
      },
      {
        scope: 'projects:read',
        description:
          'Read access to projects and their contents (messages, todos, documents etc.)',
      },
      {
        scope: 'projects:write',
        description:
          'Create and modify projects and their contents (messages, todos, documents etc.)',
      },
      {
        scope: 'projects:delete',
        description: 'Delete projects and their contents',
      },
      {
        scope: 'account',
        description:
          'Read-only access to account information (company name, product, storage usage)',
      },
    ],
    connection_settings: z.object({
      appDetails: z
        .string()
        .describe('The details of your app (e.g., example-subdomain)'),
      accountId: z
        .string()
        .regex(/[0-9]+/)
        .describe('Your Account ID (e.g., 5899981)'),
    }),
  },
} satisfies JsonConnectorDef
