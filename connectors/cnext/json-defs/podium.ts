import type {JsonConnectorDef} from '../schema'

import {z} from '@openint/util/zod-utils'

export default {
  audience: ['business'],
  verticals: ['communication'],
  display_name: 'Podium',
  stage: 'alpha',
  version: 1,
  auth: {
    type: 'OAUTH2',
    authorization_request_url: 'https://api.podium.com/oauth/authorize',
    token_request_url: 'https://api.podium.com/oauth/token',
    scope_separator: ' ',
    params_config: {
      authorize: {response_type: 'code'},
      token: {grant_type: 'authorization_code'},
    },
    openint_default_scopes: ['openid'],
    openint_allowed_scopes: ['openid', 'email', 'podium.messages.read'],
    scopes: [
      {
        scope: 'openid',
        description:
          'Authenticate users and request basic profile information (subject identifier)',
      },
      {
        scope: 'email',
        description: "Access to user's email address",
      },
      {
        scope: 'profile',
        description:
          'Access to basic profile information (name, picture, etc.)',
      },
      {
        scope: 'podium.messages.read',
        description: 'Read access to message conversations',
      },
      {
        scope: 'podium.messages.write',
        description: 'Create and update messages',
      },
      {
        scope: 'podium.contacts.full',
        description: 'Full access to contact management (read/write/delete)',
      },
    ],
    connection_settings: z.object({
      apiVersion: z
        .string()
        .describe(
          'The API version of your Podium account (e.g., example-subdomain)',
        ),
    }),
  },
} satisfies JsonConnectorDef
