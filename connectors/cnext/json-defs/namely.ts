import type {JsonConnectorDef} from '../schema'

import {z} from '@openint/util/zod-utils'

export default {
  audience: ['business'],
  verticals: ['hris'],
  display_name: 'Namely',
  stage: 'alpha',
  version: 1,
  auth: {
    type: 'OAUTH2',
    authorization_request_url:
      'https://${connection_settings.company}.namely.com/api/v1/oauth2/authorize',
    token_request_url:
      'https://${connection_settings.company}.namely.com/api/v1/oauth2/token',
    scope_separator: ' ',
    params_config: {
      authorize: {response_type: 'code'},
      token: {grant_type: 'authorization_code'},
    },
    openint_default_scopes: ['openid', 'offline_access'],
    openint_allowed_scopes: ['openid', 'offline_access', 'api:read'],
    scopes: [
      {
        scope: 'openid',
        description:
          'Provides access to authenticate the user and retrieve basic profile information (like user ID). This is the minimal scope required for authentication flows.',
      },
      {
        scope: 'profile',
        description:
          'Access to basic profile information (name, picture, etc.) beyond the minimal openid scope.',
      },
      {
        scope: 'email',
        description: "Access to the user's email address.",
      },
      {
        scope: 'offline_access',
        description: 'Allows obtaining refresh tokens for long-lived access.',
      },
      {
        scope: 'api:read',
        description: 'Read-only access to API resources.',
      },
      {
        scope: 'api:write',
        description: 'Read and write access to API resources.',
      },
      {
        scope: 'admin',
        description: 'Full administrative access to all resources.',
      },
    ],
    connection_settings: z.object({
      company: z
        .string()
        .describe('The name of your Namely company (e.g., example)'),
    }),
  },
} satisfies JsonConnectorDef
