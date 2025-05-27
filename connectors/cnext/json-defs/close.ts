import type {JsonConnectorDef} from '../schema'

export default {
  audience: ['business'],
  verticals: ['crm'],
  display_name: 'Close',
  stage: 'alpha',
  version: 1,
  auth: {
    type: 'OAUTH2',
    authorization_request_url: 'https://app.close.com/oauth2/authorize',
    token_request_url: 'https://api.close.com/oauth2/token/',
    scope_separator: ' ',
    params_config: {authorize: {response_type: 'code'}},
    openint_default_scopes: ['openid', 'offline_access'],
    openint_allowed_scopes: ['openid', 'offline_access', 'profile'],
    scopes: [
      {
        scope: 'offline_access',
        description:
          'Allows the application to obtain a refresh token, which can be used to request new access tokens even when the user is not actively using the application. This enables long-term access to the API on behalf of the user.',
      },
      {
        scope: 'openid',
        description:
          'Enables the application to authenticate the user and request basic profile information using OpenID Connect. This is often required for authorization flows to identify the user.',
      },
      {
        scope: 'profile',
        description:
          "Provides access to basic user profile information such as name, email, and profile picture. This scope has a smaller surface area than 'offline_access' as it only allows read access to basic user data.",
      },
    ],
  },
} satisfies JsonConnectorDef
