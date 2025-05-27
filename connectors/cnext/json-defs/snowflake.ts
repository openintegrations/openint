import type {JsonConnectorDef} from '../schema'

import {z} from '@openint/util/zod-utils'

export default {
  audience: ['business'],
  verticals: ['developer-tools'],
  display_name: 'Snowflake',
  stage: 'alpha',
  version: 1,
  auth: {
    type: 'OAUTH2',
    authorization_request_url:
      'https://${connection_settings.snowflake_account_url}/oauth/authorize',
    token_request_url:
      'https://${connection_settings.snowflake_account_url}/oauth/token-request',
    scope_separator: ' ',
    params_config: {
      authorize: {response_type: 'code'},
      token: {grant_type: 'authorization_code'},
    },
    openint_default_scopes: ['refresh_token'],
    openint_allowed_scopes: ['refresh_token', 'user:name'],
    scopes: [
      {
        scope: 'session:role:any',
        description:
          "Allows the OAuth client to assume any role in the user's session. This is the most privileged scope and should be used with caution.",
      },
      {
        scope: 'user:role',
        description:
          "Allows the OAuth client to access and manage the user's roles. This includes listing and switching roles.",
      },
      {
        scope: 'session:role-any',
        description:
          'Allows the OAuth client to assume any role available to the user during the session.',
      },
      {
        scope: 'refresh_token',
        description:
          'Allows the OAuth client to obtain refresh tokens for long-lived access. This is typically required for most authorization flows.',
      },
      {
        scope: 'session:role:<specific_role>',
        description:
          'Allows the OAuth client to assume a specific named role during the session. This has a smaller surface area than role-any scopes.',
      },
      {
        scope: 'user:name',
        description:
          "Allows read-only access to the user's basic profile information (name, email, etc.). This has the smallest surface area of all scopes.",
      },
    ],
    connection_settings: z.object({
      snowflake_account_url: z
        .string()
        .regex(/https:\/\/([a-z0-9_-]+)/)
        .describe(
          'The domain of your Snowflake account (e.g., https://example-subdomain)',
        ),
    }),
  },
} satisfies JsonConnectorDef
