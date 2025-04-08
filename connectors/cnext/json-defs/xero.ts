import type {JsonConnectorDef} from '../schema'

export const jsonDef = {
  audience: ['business'],
  verticals: ['accounting'],
  display_name: 'Xero',
  stage: 'ga',
  version: 1,
  auth: {
    type: 'OAUTH2',
    authorization_request_url:
      'https://login.xero.com/identity/connect/authorize',
    token_request_url: 'https://identity.xero.com/connect/token',
    scope_separator: ' ',
    params_config: {authorize: {response_type: 'code'}},
    openint_scopes: ['openid'],
    scopes: [
      {
        scope: 'offline_access',
        description:
          "This scope allows the application to obtain a refresh token, which can be used to request new access tokens even when the user is not actively using the application. This is essential for long-term access to the user's resources without requiring repeated authentication.",
      },
      {
        scope: 'openid',
        description:
          'This scope enables the application to authenticate the user and receive basic profile information (like user ID) as part of an OpenID Connect request. It does not grant access to any other user data or resources beyond basic identity verification.',
      },
    ],
  },
} satisfies JsonConnectorDef
