import type {JsonConnectorDef} from '../schema'

import {z} from '@openint/util/zod-utils'

export default {
  audience: ['business'],
  verticals: ['other'],
  display_name: 'Qualtrics',
  stage: 'alpha',
  version: 1,
  auth: {
    type: 'OAUTH2',
    authorization_request_url:
      'https://${connection_settings.subdomain}.qualtrics.com/oauth2/auth',
    token_request_url:
      'https://${connection_settings.subdomain}.qualtrics.com/oauth2/token',
    scope_separator: ' ',
    params_config: {},
    openint_default_scopes: ['openid'],
    openint_allowed_scopes: ['openid', 'email', 'surveys:read', 'directories:read'],
    scopes: [
      {
        scope: 'openid',
        description:
          'Allows access to basic user profile information (like User ID) for authentication purposes. This is the minimal scope needed for OAuth flows.',
      },
      {
        scope: 'email',
        description:
          "Provides access to the user's email address associated with their Qualtrics account.",
      },
      {
        scope: 'profile',
        description:
          'Provides access to basic profile information including name, organization, and other personal details.',
      },
      {
        scope: 'surveys:read',
        description:
          'Allows read-only access to survey definitions and responses.',
      },
      {
        scope: 'surveys:write',
        description:
          'Allows creating and modifying surveys, in addition to all read permissions.',
      },
      {
        scope: 'directories:read',
        description:
          'Provides read access to directory and contact list information.',
      },
      {
        scope: 'responseexports:read',
        description: 'Allows access to exported survey response data.',
      },
      {
        scope: 'account:read',
        description:
          'Provides read access to account-level information and settings.',
      },
    ],
    connection_settings: z.object({
      subdomain: z
        .string()
        .regex(/https:\/\/([a-z0-9_-]+)\.qualtrics\.com/)
        .describe(
          'The subdomain of your Qualtrics account (e.g., https://domain.qualtrics.com)',
        ),
    }),
  },
} satisfies JsonConnectorDef
