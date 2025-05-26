import type {JsonConnectorDef} from '../schema'

export default {
  audience: ['business'],
  verticals: ['other'],
  display_name: 'Adobe',
  stage: 'alpha',
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
    // scopes required for the oauth flow to work in the first place including refreshing
    required_scopes: ['openid', 'offline_access'],
    // the minimum ones required to meet the app's functionality.
    openint_default_scopes: ['openid', 'offline_access', 'creative_sdk'],
    // everything that is possible without requiring verification
    // must match 121 the created app for the connector
    openint_allowed_scopes: [
      'openid',
      'offline_access',
      'creative_sdk',
      'read_organizations',
      'additional_info.projectedProductContext',
      'additional_info.job_function',
    ],
    // scopes list: https://developer.adobe.com/developer-console/docs/guides/authentication/UserAuthentication/ims#scopes
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
      {
        scope: 'read_organizations',
        description:
          'Provides read-only access to organization information and structure.',
      },
      {
        scope: 'additional_info.projectedProductContext',
        description:
          'Provides access to projected product context information for enhanced user experience.',
      },
      {
        scope: 'additional_info.job_function',
        description:
          'Provides access to user job function information for role-based access control.',
      },
    ],
  },
} satisfies JsonConnectorDef
