import type {JsonConnectorDef} from '../schema'

export default {
  audience: ['business'],
  verticals: ['other'],
  display_name: 'Adobe',
  stage: 'ga',
  version: 1,
  auth: {
    type: 'OAUTH2',
    authorization_request_url:
      'https://ims-na1.adobelogin.com/ims/authorize/v2',
    token_request_url: 'https://ims-na1.adobelogin.com/ims/token/v3',
    scope_separator: ' ',
    params_config: {
      authorize: {response_type: 'code'},
      token: {grant_type: 'authorization_code'},
    },
    openint_default_scopes: ['openid'],
    openint_allowed_scopes: ['openid', 'AdobeID'],
    scopes: [
      {
        scope: 'openid',
        description:
          "Provides access to the user's basic OpenID Connect information, including their unique identifier (sub) and authentication time. This scope is required for most OAuth flows in Adobe's identity system.",
      },
      {
        scope: 'offline_access',
        description:
          'Allows the application to obtain refresh tokens, enabling long-term access to Adobe services even when the user is not actively using the application. This is essential for background operations or syncing data.',
      },
      {
        scope: 'AdobeID',
        description:
          "Provides access to the user's Adobe ID profile information, such as email, name, and account details. This is a basic scope for identifying the user.",
      },
      {
        scope: 'creative_sdk',
        description:
          "Grants access to Adobe Creative SDK services, enabling integration with Adobe's creative tools and assets. This scope is broader and includes read/write capabilities for creative projects.",
      },
      {
        scope: 'user_management',
        description:
          'Allows the application to manage user accounts, including creating, updating, and deleting users. This scope has a large surface area and should be used cautiously.',
      },
    ],
  },
} satisfies JsonConnectorDef
