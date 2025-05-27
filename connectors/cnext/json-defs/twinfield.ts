import type {JsonConnectorDef} from '../schema'

import {z} from '@openint/util/zod-utils'

export default {
  audience: ['business'],
  verticals: ['other'],
  display_name: 'Twinfield',
  stage: 'alpha',
  version: 1,
  auth: {
    type: 'OAUTH2',
    authorization_request_url:
      'https://login.twinfield.com/auth/authentication/connect/authorize',
    token_request_url:
      'https://login.twinfield.com/auth/authentication/connect/token',
    scope_separator: ' ',
    params_config: {
      authorize: {response_type: 'code', nonce: 'AnotherRandomStringTwinfield'},
    },
    openint_default_scopes: ['openid', 'offline_access'],
    openint_allowed_scopes: ['openid', 'offline_access', 'twf.user'],
    scopes: [
      {
        scope: 'openid',
        description:
          'This scope is used to authenticate the user and obtain basic profile information. It is part of the OpenID Connect standard and provides the minimal identity information about the user.',
      },
      {
        scope: 'twf.user',
        description:
          "This scope provides access to the user's basic Twinfield profile information, such as their name, email, and other personal details. It does not grant access to any organizational data.",
      },
      {
        scope: 'twf.organisation',
        description:
          'This scope grants access to the organization-level data in Twinfield, such as company details, financial settings, and other administrative information. It is broader than user-specific scopes.',
      },
      {
        scope: 'twf.organisationUser',
        description:
          "This scope provides access to the user's role and permissions within the organization. It includes information about the user's access rights and organizational assignments.",
      },
      {
        scope: 'offline_access',
        description:
          "This scope allows the application to obtain refresh tokens, enabling it to access the user's data even when the user is not actively using the application. It is used for long-lived access.",
      },
    ],
    connection_settings: z.object({
      cluster: z
        .string()
        .regex(/https:\/\/([a-z0-9_-]+)\.twinfield\.com/)
        .describe(
          'The cluster to your Twinfield instance (e.g., https://accounting.twinfield.com)',
        ),
    }),
  },
} satisfies JsonConnectorDef
