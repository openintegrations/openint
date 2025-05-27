import type {JsonConnectorDef} from '../schema'

export default {
  audience: ['business'],
  verticals: ['other'],
  display_name: 'Keap',
  stage: 'alpha',
  version: 1,
  auth: {
    type: 'OAUTH2',
    authorization_request_url:
      'https://accounts.infusionsoft.com/app/oauth/authorize',
    token_request_url: 'https://api.infusionsoft.com/token',
    scope_separator: ' ',
    params_config: {
      authorize: {response_type: 'code'},
      token: {grant_type: 'authorization_code'},
    },
    openint_default_scopes: ['openid', 'offline_access'],
    openint_allowed_scopes: ['openid', 'offline_access', 'contacts|readonly', 'calendar'],
    scopes: [
      {
        scope: 'openid',
        description:
          'Allows access to basic user profile information (like user ID) during authentication',
      },
      {
        scope: 'email',
        description: "Allows access to the user's email address",
      },
      {
        scope: 'profile',
        description:
          'Allows access to basic profile information (name, picture, etc.)',
      },
      {
        scope: 'contacts|readonly',
        description: 'Read-only access to contact records',
      },
      {
        scope: 'contacts',
        description: 'Full read/write access to contact records',
      },
      {
        scope: 'calendar',
        description: 'Access to calendar events and appointments',
      },
      {
        scope: 'ecommerce',
        description:
          'Access to e-commerce related data (orders, products, etc.)',
      },
      {
        scope: 'fulfillment',
        description: 'Access to order fulfillment services',
      },
      {
        scope: 'tasks',
        description: 'Access to task management features',
      },
      {
        scope: 'offline_access',
        description: 'Allows obtaining refresh tokens for long-term access',
      },
    ],
  },
} satisfies JsonConnectorDef
