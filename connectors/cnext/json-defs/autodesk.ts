import type {JsonConnectorDef} from '../schema'

export default {
  audience: ['business'],
  verticals: ['other'],
  display_name: 'Autodesk',
  stage: 'alpha',
  version: 1,
  auth: {
    type: 'OAUTH2',
    authorization_request_url:
      'https://developer.api.autodesk.com/authentication/v2/authorize',
    token_request_url:
      'https://developer.api.autodesk.com/authentication/v2/token',
    scope_separator: ' ',
    params_config: {
      authorize: {response_type: 'code'},
      token: {grant_type: 'authorization_code'},
    },
    openint_default_scopes: ['openid', 'data:read'],
    openint_allowed_scopes: ['openid', 'data:read', 'bucket:read'],
    scopes: [
      {
        scope: 'openid',
        description:
          "Provides access to the user's basic profile information (like user ID) using OpenID Connect. This is the minimal scope needed for authentication.",
      },
      {
        scope: 'data:read',
        description:
          'Read-only access to user data and models. This allows viewing but no modifications.',
      },
      {
        scope: 'data:write',
        description:
          'Read and write access to user data and models. This allows both viewing and modifications.',
      },
      {
        scope: 'bucket:create',
        description: 'Allows creating new storage buckets for file uploads.',
      },
      {
        scope: 'bucket:read',
        description: 'Read-only access to storage buckets and their contents.',
      },
      {
        scope: 'bucket:update',
        description: 'Allows modifying existing storage buckets.',
      },
      {
        scope: 'bucket:delete',
        description: 'Allows deleting storage buckets and their contents.',
      },
      {
        scope: 'code:all',
        description:
          'Full access to all code-related functionality (most privileged scope).',
      },
      {
        scope: 'user-profile:read',
        description: "Read access to the user's full profile information.",
      },
    ],
  },
} satisfies JsonConnectorDef
