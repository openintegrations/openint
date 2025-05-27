import type {JsonConnectorDef} from '../schema'

import {z} from '@openint/util/zod-utils'

export default {
  audience: ['business'],
  verticals: ['file-storage'],
  display_name: 'Egnyte',
  stage: 'alpha',
  version: 1,
  auth: {
    type: 'OAUTH2',
    authorization_request_url:
      'https://${connection_settings.subdomain}.egnyte.com/puboauth/token',
    token_request_url:
      'https://${connection_settings.subdomain}.egnyte.com/puboauth/token',
    scope_separator: ' ',
    params_config: {
      authorize: {response_type: 'code'},
      token: {grant_type: 'authorization_code'},
    },
    openint_default_scopes: ['offline_access', 'openid'],
    openint_allowed_scopes: ['offline_access', 'openid', 'Egnyte.link_read', 'Egnyte.filesystem_readonly'],
    scopes: [
      {
        scope: 'Egnyte.filesystem',
        description:
          "Provides read and write access to files and folders in Egnyte's filesystem. This is a broad scope that allows full access to the user's file storage.",
      },
      {
        scope: 'Egnyte.filesystem_readonly',
        description:
          "Provides read-only access to files and folders in Egnyte's filesystem. This scope allows viewing but not modifying content.",
      },
      {
        scope: 'Egnyte.link_read',
        description:
          "Allows reading of shared links and their properties, but doesn't allow creating or modifying them.",
      },
      {
        scope: 'Egnyte.link',
        description:
          'Provides full access to shared links, including creating, modifying, and deleting them.',
      },
      {
        scope: 'offline_access',
        description:
          'Allows the application to refresh access tokens when the user is not actively using the application. This is typically required for background operations.',
      },
      {
        scope: 'openid',
        description:
          'Required for OpenID Connect flows to authenticate users and get basic profile information.',
      },
      {
        scope: 'profile',
        description:
          'Provides access to basic user profile information (name, email, etc.).',
      },
    ],
    connection_settings: z.object({
      subdomain: z
        .string()
        .regex(/https:\/\/([a-z0-9_-]+)\.egnyte\.com/)
        .describe(
          'The subdomain of your Egnyte account (e.g., https://domain.egnyte.com)',
        ),
    }),
  },
} satisfies JsonConnectorDef
