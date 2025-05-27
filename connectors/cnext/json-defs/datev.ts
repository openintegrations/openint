import type {JsonConnectorDef} from '../schema'

export default {
  audience: ['business'],
  verticals: ['hris'],
  display_name: 'Datev',
  stage: 'alpha',
  version: 1,
  auth: {
    type: 'OAUTH2',
    authorization_request_url: 'https://login.datev.de/openid/authorize',
    token_request_url: 'https://api.datev.de/token',
    scope_separator: ' ',
    params_config: {
      authorize: {
        response_type: 'code id_token',
        response_mode: 'query',
        nonce: 'AnotherRandomStringDatev',
      },
      token: {grant_type: 'authorization_code'},
    },
    openint_default_scopes: ['openid', 'offline_access'],
    openint_allowed_scopes: ['openid', 'offline_access', 'datev'],
    scopes: [
      {
        scope: 'openid',
        description:
          "This scope is used to authenticate the user and obtain basic profile information (like the user's ID). It is mandatory for OpenID Connect flows and provides the least privileges as it only allows authentication and does not grant access to any DATEV-specific resources.",
      },
      {
        scope: 'profile',
        description:
          "This scope provides access to the user's basic profile information, such as name and email address. It extends the 'openid' scope but still has a relatively small surface area as it does not grant access to sensitive or business-specific data.",
      },
      {
        scope: 'email',
        description:
          "This scope provides access to the user's email address. Like the 'profile' scope, it extends the 'openid' scope but is limited to email information only.",
      },
      {
        scope: 'offline_access',
        description:
          'This scope requests a refresh token, allowing the application to obtain new access tokens without user interaction. It is necessary for long-lived access but increases the surface area as it maintains access over time.',
      },
      {
        scope: 'datev',
        description:
          'This scope provides access to DATEV-specific resources, such as accounting data or business operations. It has a larger surface area as it grants access to sensitive business data.',
      },
    ],
  },
} satisfies JsonConnectorDef
