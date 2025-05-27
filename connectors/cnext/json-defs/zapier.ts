import type {JsonConnectorDef} from '../schema'

export default {
  audience: ['business'],
  verticals: ['developer-tools'],
  display_name: 'Zapier',
  stage: 'alpha',
  version: 1,
  auth: {
    type: 'OAUTH2',
    authorization_request_url: 'https://api.zapier.com/v2/authorize',
    token_request_url: 'https://zapier.com/oauth/token',
    scope_separator: ' ',
    params_config: {
      authorize: {
        response_type: 'code',
        response_mode: 'query',
        state: 'N@nG0s%rinG',
      },
      token: {grant_type: 'authorization_code'},
    },
    openint_default_scopes: ['authentication'],
    openint_allowed_scopes: ['authentication', 'profile', 'zap'],
    scopes: [
      {
        scope: 'authentication',
        description:
          'Allows read-only access to authentication-related information, such as verifying user credentials and checking authentication status. This scope does not permit any modifications.',
      },
      {
        scope: 'profile',
        description:
          "Provides read-only access to the user's basic profile information, such as name, email, and other non-sensitive details. This scope does not allow any changes to the profile.",
      },
      {
        scope: 'authentication:write',
        description:
          "Allows modifying authentication-related settings, such as updating credentials or managing authentication sessions. This scope includes the privileges of the 'authentication' scope.",
      },
      {
        scope: 'zap',
        description:
          'Provides read-only access to Zaps (automated workflows), including their configurations and statuses. This scope does not allow creating, modifying, or executing Zaps.',
      },
      {
        scope: 'zap:write',
        description:
          "Allows full management of Zaps, including creating, updating, deleting, and executing them. This scope includes the privileges of the 'zap' scope.",
      },
    ],
  },
} satisfies JsonConnectorDef
