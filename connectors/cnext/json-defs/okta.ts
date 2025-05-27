import type {JsonConnectorDef} from '../schema'

import {z} from '@openint/util/zod-utils'

export default {
  audience: ['business'],
  verticals: ['developer-tools'],
  display_name: 'Okta',
  stage: 'alpha',
  version: 1,
  auth: {
    type: 'OAUTH2',
    authorization_request_url:
      'https://${connection_settings.subdomain}.okta.com/oauth2/v1/authorize',
    token_request_url:
      'https://${connection_settings.subdomain}.okta.com/oauth2/v1/token',
    scope_separator: ' ',
    params_config: {
      authorize: {response_type: 'code', response_mode: 'query'},
      token: {grant_type: 'authorization_code'},
    },
    openint_default_scopes: ['openid', 'offline_access'],
    openint_allowed_scopes: ['openid', 'offline_access', 'okta.users.read'],
    scopes: [
      {
        scope: 'openid',
        description:
          "Required for OpenID Connect flows. Grants access to return the 'sub' claim which uniquely identifies the user.",
      },
      {
        scope: 'profile',
        description:
          'Grants access to basic user profile information including name, locale, timezone, etc.',
      },
      {
        scope: 'email',
        description:
          "Grants access to the user's email address and email verification status.",
      },
      {
        scope: 'address',
        description:
          "Grants access to the user's physical address information.",
      },
      {
        scope: 'phone',
        description:
          "Grants access to the user's phone number and phone verification status.",
      },
      {
        scope: 'offline_access',
        description:
          'Grants ability to request refresh tokens for long-lived access.',
      },
      {
        scope: 'okta.users.read',
        description:
          'Read-only access to user profiles and basic user information.',
      },
      {
        scope: 'okta.users.manage',
        description: 'Full access to create, update, and delete user profiles.',
      },
      {
        scope: 'okta.groups.read',
        description: 'Read-only access to group information and memberships.',
      },
      {
        scope: 'okta.groups.manage',
        description:
          'Full access to create, update, and delete groups and memberships.',
      },
      {
        scope: 'okta.apps.read',
        description: 'Read-only access to application information.',
      },
      {
        scope: 'okta.apps.manage',
        description: 'Full access to create, update, and delete applications.',
      },
      {
        scope: 'okta.devices.read',
        description: 'Read-only access to device information.',
      },
    ],
    connection_settings: z.object({
      subdomain: z
        .string()
        .regex(/https:\/\/([a-z0-9_-]+)\.okta\.com/)
        .describe(
          'The subdomain of your Okta account (e.g., https://domain.okta.com)',
        ),
    }),
  },
} satisfies JsonConnectorDef
