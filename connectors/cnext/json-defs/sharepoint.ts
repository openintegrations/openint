import type {JsonConnectorDef} from '../schema'

export default {
  audience: ['business'],
  verticals: ['file-storage', 'communication'],
  display_name: 'SharePoint Online (v2)',
  stage: 'ga',
  version: 1,
  auth: {
    type: 'OAUTH2',
    authorization_request_url:
      'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
    token_request_url:
      'https://login.microsoftonline.com/common/oauth2/v2.0/token',
    scope_separator: ' ',
    params_config: {
      authorize: {
        response_type: 'code',
        response_mode: 'query',
        prompt: 'consent',
      },
      token: {grant_type: 'authorization_code'},
    },
    openint_scopes: ['offline_access', 'openid'],
    scopes: [
      {
        scope: 'offline_access',
        description:
          'Allows the application to request refresh tokens, which can be used to obtain new access tokens without user interaction. This enables the application to maintain access to resources even when the user is not actively using the application.',
      },
      {
        scope: 'openid',
        description:
          'Enables user authentication and allows the application to receive a unique identifier for the user. This scope is required for OpenID Connect authentication flows and provides basic identity information about the authenticated user.',
      },
    ],
  },
} satisfies JsonConnectorDef
