import type {JsonConnectorDef} from '../schema'

export default {
  audience: ['business'],
  verticals: ['developer-tools'],
  display_name: 'DigitalOcean',
  stage: 'alpha',
  version: 1,
  auth: {
    type: 'OAUTH2',
    authorization_request_url:
      'https://cloud.digitalocean.com/v1/oauth/authorize',
    token_request_url: 'https://cloud.digitalocean.com/v1/oauth/token',
    scope_separator: ' ',
    params_config: {
      authorize: {response_type: 'code'},
      token: {grant_type: 'authorization_code'},
    },
    openint_default_scopes: ['openid'],
    openint_allowed_scopes: ['openid', 'read'],
    scopes: [
      {
        scope: 'read',
        description:
          'Provides read-only access to your DigitalOcean account information, including user details, droplets, snapshots, and other resources. This scope does not allow any modifications.',
      },
      {
        scope: 'write',
        description:
          'Provides read and write access to your DigitalOcean resources, allowing creation, modification, and deletion of droplets, snapshots, and other resources.',
      },
      {
        scope: 'read write',
        description:
          'Combines read and write access, providing full access to your DigitalOcean resources for both viewing and modifying.',
      },
      {
        scope: 'read write delete',
        description:
          'Provides full access including read, write, and delete permissions for all DigitalOcean resources in your account.',
      },
      {
        scope: 'openid',
        description:
          'Used for OpenID Connect authentication, allowing the application to verify the identity of the user and get basic profile information.',
      },
    ],
  },
} satisfies JsonConnectorDef
