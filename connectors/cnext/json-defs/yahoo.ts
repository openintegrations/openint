import type {JsonConnectorDef} from '../schema'

import {z} from '@openint/util/zod-utils'

export default {
  audience: ['business'],
  verticals: ['social-media'],
  display_name: 'Yahoo',
  stage: 'alpha',
  version: 1,
  auth: {
    type: 'OAUTH2',
    authorization_request_url:
      'https://api.login.yahoo.com/oauth2/request_auth',
    token_request_url: 'https://api.login.yahoo.com/oauth2/get_token',
    scope_separator: ' ',
    params_config: {},
    openint_default_scopes: ['openid'],
    openint_allowed_scopes: ['openid', 'fspt-r', 'mail-r'],
    scopes: [
      {
        scope: 'openid',
        description:
          'Allows access to basic user profile information (User ID) for authentication purposes',
      },
      {
        scope: 'profile',
        description:
          'Provides access to basic profile information including name, profile picture, and other public details',
      },
      {
        scope: 'email',
        description: "Provides access to the user's primary email address",
      },
      {
        scope: 'fspt-w',
        description: 'Write access to Yahoo Fantasy Sports data',
      },
      {
        scope: 'fspt-r',
        description: 'Read-only access to Yahoo Fantasy Sports data',
      },
      {
        scope: 'mail-r',
        description: 'Read access to Yahoo Mail messages and folders',
      },
      {
        scope: 'mail-w',
        description: 'Write access to Yahoo Mail including sending messages',
      },
      {
        scope: 'sdct-w',
        description: 'Write access to Yahoo Contacts',
      },
      {
        scope: 'sdct-r',
        description: 'Read access to Yahoo Contacts',
      },
    ],
    connection_settings: z.object({
      apiDomain: z
        .string()
        .regex(/https:\/\/([a-z0-9_-]+)/)
        .describe(
          'The domain to the API you want to connect to (e.g., https://fantasysports.yahooapis.com)',
        ),
    }),
  },
} satisfies JsonConnectorDef
