import type {JsonConnectorDef} from '../schema'

import {z} from '@openint/util/zod-utils'

export default {
  audience: ['business'],
  verticals: ['other'],
  display_name: 'ServiceNow',
  stage: 'alpha',
  version: 1,
  auth: {
    type: 'OAUTH2',
    authorization_request_url:
      'https://${connection_settings.subdomain}.service-now.com/oauth_auth.do',
    token_request_url:
      'https://${connection_settings.subdomain}.service-now.com/oauth_token.do',
    scope_separator: ' ',
    params_config: {
      authorize: {response_type: 'code'},
      token: {grant_type: 'authorization_code'},
    },
    openint_default_scopes: ['openid', 'offline_access'],
    openint_allowed_scopes: ['openid', 'offline_access', 'incident.read', 'useraccount'],
    scopes: [
      {
        scope: 'useraccount',
        description:
          "Allows the application to read the user's basic profile information, such as name, email, and user ID.",
      },
      {
        scope: 'openid',
        description:
          "Enables OpenID Connect authentication, allowing the application to verify the user's identity and obtain basic profile information.",
      },
      {
        scope: 'email',
        description:
          "Allows the application to access the user's email address.",
      },
      {
        scope: 'all',
        description:
          'Provides full access to all APIs and functionalities in the ServiceNow instance, equivalent to administrator privileges.',
      },
      {
        scope: 'offline_access',
        description:
          "Allows the application to obtain a refresh token for long-term access to the user's resources without requiring re-authentication.",
      },
      {
        scope: 'chat:write',
        description:
          "Allows the application to send messages on behalf of the user in ServiceNow's chat or messaging features.",
      },
      {
        scope: 'incident.read',
        description:
          'Allows read-only access to incident records in ServiceNow.',
      },
      {
        scope: 'incident.write',
        description:
          'Allows create, update, and delete access to incident records in ServiceNow.',
      },
    ],
    connection_settings: z.object({
      subdomain: z
        .string()
        .regex(/https:\/\/([a-z0-9_-]+)\.service-now\.com/)
        .describe(
          'The subdomain of your ServiceNow account (e.g., https://domain.service-now.com)',
        ),
    }),
  },
} satisfies JsonConnectorDef
