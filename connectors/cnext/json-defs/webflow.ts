import type {JsonConnectorDef} from '../schema'

export default {
  audience: ['business'],
  verticals: ['developer-tools'],
  display_name: 'Webflow',
  stage: 'alpha',
  version: 1,
  auth: {
    type: 'OAUTH2',
    authorization_request_url: 'https://webflow.com/oauth/authorize',
    token_request_url: 'https://api.webflow.com/oauth/access_token',
    scope_separator: ' ',
    params_config: {
      authorize: {response_type: 'code'},
      token: {grant_type: 'authorization_code'},
    },
    openint_default_scopes: ['openid'],
    openint_allowed_scopes: ['openid', 'sites:read', 'cms:read'],
    scopes: [
      {
        scope: 'openid',
        description:
          "Provides access to the user's basic profile information (like user ID) using OpenID Connect standard.",
      },
      {
        scope: 'email',
        description: "Provides access to the user's email address.",
      },
      {
        scope: 'sites:read',
        description: 'Read-only access to site information and configurations.',
      },
      {
        scope: 'sites:write',
        description:
          'Read and write access to site information and configurations.',
      },
      {
        scope: 'cms:read',
        description: 'Read-only access to CMS collections and items.',
      },
      {
        scope: 'cms:write',
        description: 'Read and write access to CMS collections and items.',
      },
      {
        scope: 'ecommerce:read',
        description:
          'Read-only access to e-commerce data including products, orders, and inventory.',
      },
      {
        scope: 'ecommerce:write',
        description:
          'Read and write access to e-commerce data including products, orders, and inventory.',
      },
      {
        scope: 'forms:read',
        description: 'Read-only access to form submissions.',
      },
      {
        scope: 'forms:write',
        description: 'Read and write access to form submissions.',
      },
    ],
  },
} satisfies JsonConnectorDef
