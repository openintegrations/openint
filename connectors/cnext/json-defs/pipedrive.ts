import type {JsonConnectorDef} from '../schema'

import {z} from '@openint/util/zod-utils'

export default {
  audience: ['business'],
  verticals: ['crm'],
  display_name: 'Pipedrive',
  stage: 'ga',
  version: 1,
  auth: {
    type: 'OAUTH2',
    authorization_request_url: 'https://oauth.pipedrive.com/oauth/authorize',
    token_request_url: 'https://oauth.pipedrive.com/oauth/token',
    scope_separator: ' ',
    params_config: {},
    openint_scopes: ['base'],
    scopes: [
      {
        scope: 'base',
        description:
          'Provides access to basic user information such as name, email, and company details. Does not include access to any deal, person, or organization data.',
      },
      {
        scope: 'contacts:read',
        description:
          "Allows read-only access to contacts (persons and organizations) including their details, but doesn't permit any modifications.",
      },
      {
        scope: 'contacts:write',
        description:
          'Provides read and write access to contacts (persons and organizations), allowing creation, modification, and deletion of contact information.',
      },
      {
        scope: 'deals:read',
        description:
          "Grants read-only access to deals including their stages, values, and associated data, but doesn't allow any changes.",
      },
      {
        scope: 'deals:write',
        description:
          'Provides full access to deals including creating, modifying, and deleting deals, as well as changing deal stages.',
      },
      {
        scope: 'users:read',
        description:
          "Allows reading user information across the organization, including team members' details, but no modifications.",
      },
      {
        scope: 'admin',
        description:
          'Provides full administrative access including organization settings, user management, and all data. This is the most privileged scope.',
      },
    ],
    connection_settings: z.object({
      api_domain: z
        .string()
        .regex(/https?:\/\/.*/)
        .describe('The API URL of your Pipedrive account (e.g., example)'),
    }),
  },
} satisfies JsonConnectorDef
