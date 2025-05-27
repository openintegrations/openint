import type {JsonConnectorDef} from '../schema'

import {z} from '@openint/util/zod-utils'

export default {
  audience: ['business'],
  verticals: ['other'],
  display_name: 'Contentstack',
  stage: 'alpha',
  version: 1,
  auth: {
    type: 'OAUTH2',
    authorization_request_url:
      'https://${connection_settings.subdomain}.contentstack.com/apps/${connection_settings.appId}/authorize',
    token_request_url:
      'https://${connection_settings.subdomain}.contentstack.com/apps-api/apps/token',
    scope_separator: ' ',
    params_config: {},
    openint_default_scopes: ['offline_access'],
    openint_allowed_scopes: ['offline_access', 'user.read', 'assets.read'],
    scopes: [
      {
        scope: 'user.read',
        description: 'Read basic user profile information (name, email, etc.)',
      },
      {
        scope: 'content_types.read',
        description: 'Read content type definitions and schemas',
      },
      {
        scope: 'entries.read',
        description: 'Read content entries across all content types',
      },
      {
        scope: 'assets.read',
        description: 'Read digital assets (images, files) in the repository',
      },
      {
        scope: 'content_types.manage',
        description: 'Create, update, and delete content types',
      },
      {
        scope: 'entries.manage',
        description: 'Create, update, and delete content entries',
      },
      {
        scope: 'assets.manage',
        description: 'Upload, update, and delete digital assets',
      },
      {
        scope: 'admin',
        description:
          'Full administrative access to all ContentStack features and settings',
      },
      {
        scope: 'offline_access',
        description: 'Required for refresh token functionality in OAuth flows',
      },
    ],
    connection_settings: z.object({
      subdomain: z
        .string()
        .regex(/https:\/\/([a-z0-9_-]+)\.contentstack\.com/)
        .describe(
          'The subdomain of your Contentstack account (e.g., https://domain.contentstack.com)',
        ),
      appId: z
        .string()
        .describe(
          'The app ID of your Contentstack account (e.g., example-subdomain)',
        ),
      apiDomain: z
        .string()
        .regex(/https:\/\/([a-z0-9_-]+)/)
        .describe(
          'The domain to where you will access your API (e.g., https://eu-api.contentstack.com)',
        ),
    }),
  },
} satisfies JsonConnectorDef
