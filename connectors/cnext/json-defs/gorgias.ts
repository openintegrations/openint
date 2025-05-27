import type {JsonConnectorDef} from '../schema'

import {z} from '@openint/util/zod-utils'

export default {
  audience: ['business'],
  verticals: ['commerce'],
  display_name: 'Gorgias',
  stage: 'alpha',
  version: 1,
  auth: {
    type: 'OAUTH2',
    authorization_request_url:
      'https://${connection_settings.subdomain}.gorgias.com/oauth/authorize',
    token_request_url:
      'https://${connection_settings.subdomain}.gorgias.com/oauth/token',
    scope_separator: ' ',
    params_config: {
      authorize: {response_type: 'code'},
      token: {grant_type: 'authorization_code'},
    },
    openint_default_scopes: ['offline'],
    openint_allowed_scopes: ['offline'],
    scopes: [
      {
        scope: 'offline',
        description:
          "Allows the application to obtain a refresh token, which can be used to request new access tokens without user interaction. This is useful for long-term access to the user's resources when they are not actively using the application.",
      },
    ],
    connection_settings: z.object({
      subdomain: z
        .string()
        .regex(/https:\/\/([a-z0-9_-]+)\.gorgias\.com/)
        .describe(
          'The subdomain of your Gorgias account (e.g., https://domain.gorgias.com)',
        ),
    }),
  },
} satisfies JsonConnectorDef
