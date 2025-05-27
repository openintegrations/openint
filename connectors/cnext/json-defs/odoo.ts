import type {JsonConnectorDef} from '../schema'

import {z} from '@openint/util/zod-utils'

export default {
  audience: ['business'],
  verticals: ['other'],
  display_name: 'Odoo (OAuth)',
  stage: 'alpha',
  version: 1,
  auth: {
    type: 'OAUTH2',
    authorization_request_url:
      'https://${connection_settings.serverUrl}/restapi/1.0/common/oauth2/authorize',
    token_request_url:
      'https://${connection_settings.serverUrl}/restapi/1.0/common/oauth2/access_token',
    scope_separator: ' ',
    params_config: {
      authorize: {response_type: 'code'},
      token: {grant_type: 'authorization_code'},
    },
    openint_default_scopes: ['openid'],
    openint_allowed_scopes: ['openid', 'profile', 'odoo.base'],
    scopes: [
      {
        scope: 'openid',
        description:
          'Provides access to authenticate the user and retrieve basic user profile information (subject identifier)',
      },
      {
        scope: 'profile',
        description:
          'Provides access to basic user profile information (name, email, etc.)',
      },
      {
        scope: 'email',
        description: "Provides access to the user's email address",
      },
      {
        scope: 'odoo.api',
        description:
          "Provides access to Odoo's external API for reading and writing data",
      },
      {
        scope: 'odoo.all',
        description:
          'Provides full access to all Odoo functionalities and data',
      },
      {
        scope: 'odoo.base',
        description:
          'Provides basic access to Odoo including user information and limited API access',
      },
    ],
    connection_settings: z.object({
      serverUrl: z
        .string()
        .regex(/https:\/\/([a-z0-9_-]+)/)
        .describe(
          'The domain of your Odoo account (e.g., https://example-subdomain)',
        ),
    }),
  },
} satisfies JsonConnectorDef
