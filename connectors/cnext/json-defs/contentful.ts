import type {JsonConnectorDef} from '../schema'

import {z} from '@openint/util/zod-utils'

export default {
  audience: ['business'],
  verticals: ['developer-tools'],
  display_name: 'Contentful',
  stage: 'alpha',
  version: 1,
  auth: {
    type: 'OAUTH2',
    authorization_request_url: 'https://be.contentful.com/oauth/authorize',
    token_request_url: 'https://be.contentful.com/oauth/token',
    scope_separator: ' ',
    params_config: {
      authorize: {response_type: 'code'},
      token: {grant_type: 'authorization_code'},
    },
    openint_default_scopes: ['offline_access', 'openid'],
    openint_allowed_scopes: [
      'offline_access',
      'openid',
      'content_delivery_read',
    ],
    scopes: [
      {
        scope: 'content_management_manage',
        description:
          'Full access to manage all content types, entries, and assets across all spaces. This is the most powerful scope with the largest surface area.',
      },
      {
        scope: 'content_management_read',
        description:
          'Read-only access to content types, entries, and assets across all spaces. Cannot make any modifications.',
      },
      {
        scope: 'content_delivery_manage',
        description:
          'Access to manage delivery API keys and settings, but not content itself.',
      },
      {
        scope: 'content_delivery_read',
        description:
          'Read-only access to content through the delivery API. This is typically the smallest surface area scope as it only allows reading published content.',
      },
      {
        scope: 'user_management_manage',
        description:
          'Access to manage users and their permissions within Contentful.',
      },
      {
        scope: 'offline_access',
        description:
          'Allows obtaining refresh tokens for long-lived access. This is often mandatory for authorization flows that require persistent access.',
      },
      {
        scope: 'openid',
        description:
          'Required for OpenID Connect compliant authentication. Mandatory for user authentication flows.',
      },
      {
        scope: 'space_management_manage',
        description:
          'Access to create, modify, and delete spaces within the organization.',
      },
    ],
    connection_settings: z.object({
      subdomain: z
        .string()
        .regex(/https:\/\/([a-z0-9_-]+)\.contentful\.com/)
        .describe(
          'The subdomain of your Contentful account (e.g., https://domain.contentful.com)',
        ),
    }),
  },
} satisfies JsonConnectorDef
