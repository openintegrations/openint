import type {JsonConnectorDef} from '../schema'

import {z} from '@openint/util/zod-utils'

export default {
  audience: ['business'],
  verticals: ['other'],
  display_name: 'Auth0',
  stage: 'alpha',
  version: 1,
  auth: {
    type: 'OAUTH2',
    authorization_request_url:
      'https://${connection_settings.subdomain}.auth0.com/authorize',
    token_request_url:
      'https://${connection_settings.subdomain}.auth0.com/oauth/token',
    scope_separator: ' ',
    params_config: {
      authorize: {response_type: 'code', response_mode: 'query'},
      token: {grant_type: 'authorization_code'},
    },
    openint_default_scopes: ['openid', 'offline_access'],
    openint_allowed_scopes: ['openid', 'offline_access', 'read:users'],
    scopes: [
      {
        scope: 'openid',
        description:
          'Mandatory for OpenID Connect flows. Provides access to return the ID Token and the default user profile claims (sub, name, email, etc.).',
      },
      {
        scope: 'profile',
        description:
          "Provides access to basic profile information (name, nickname, picture, etc.) beyond what's included in the ID Token.",
      },
      {
        scope: 'email',
        description:
          "Provides access to the user's email address and email verification status.",
      },
      {
        scope: 'read:users',
        description:
          'Provides read-only access to user profile information in the Auth0 Management API.',
      },
      {
        scope: 'create:users',
        description:
          'Provides ability to create new user accounts in the Auth0 Management API.',
      },
      {
        scope: 'update:users',
        description:
          'Provides ability to update existing user accounts in the Auth0 Management API.',
      },
      {
        scope: 'delete:users',
        description:
          'Provides ability to delete user accounts in the Auth0 Management API (highest privilege user scope).',
      },
      {
        scope: 'offline_access',
        description:
          'Required for refresh token functionality in OAuth flows that support it.',
      },
    ],
    connection_settings: z.object({
      subdomain: z
        .string()
        .regex(/https:\/\/([a-z0-9_-]+)\.auth0\.com/)
        .describe(
          'The subdomain of your Auth0 account (e.g., https://domain.auth0.com)',
        ),
    }),
  },
} satisfies JsonConnectorDef
