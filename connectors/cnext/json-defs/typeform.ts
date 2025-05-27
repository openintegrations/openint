import type {JsonConnectorDef} from '../schema'

export default {
  audience: ['business'],
  verticals: ['other'],
  display_name: 'Typeform',
  stage: 'alpha',
  version: 1,
  auth: {
    type: 'OAUTH2',
    authorization_request_url: 'https://api.typeform.com/oauth/authorize',
    token_request_url: 'https://api.typeform.com/oauth/token',
    scope_separator: ' ',
    params_config: {
      authorize: {response_type: 'code'},
      token: {grant_type: 'authorization_code'},
    },
    openint_default_scopes: ['accounts:read', 'offline'],
    openint_allowed_scopes: ['accounts:read', 'forms:read', 'offline'],
    scopes: [
      {
        scope: 'offline',
        description:
          "Allows the application to obtain a refresh token, which can be used to request new access tokens without user interaction. This is useful for long-term access to the user's data.",
      },
      {
        scope: 'forms:read',
        description:
          "Provides read-only access to the user's forms and form responses. This scope allows the application to retrieve form details and responses but does not permit any modifications.",
      },
      {
        scope: 'forms:write',
        description:
          "Provides write access to the user's forms, allowing the application to create, update, and delete forms and form responses.",
      },
      {
        scope: 'responses:read',
        description:
          "Provides read-only access to the user's form responses. This scope allows the application to retrieve response data but does not permit any modifications.",
      },
      {
        scope: 'accounts:read',
        description:
          "Provides read-only access to the user's account information, such as profile details and account settings.",
      },
    ],
  },
} satisfies JsonConnectorDef
