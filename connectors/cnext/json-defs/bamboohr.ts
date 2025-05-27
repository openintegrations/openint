import type {JsonConnectorDef} from '../schema'

import {z} from '@openint/util/zod-utils'

export default {
  audience: ['business'],
  verticals: ['hris'],
  display_name: 'BambooHR (OAuth)',
  stage: 'alpha',
  version: 1,
  auth: {
    type: 'OAUTH2',
    authorization_request_url:
      'https://${connection_settings.subdomain}.bamboohr.com/authorize.php',
    token_request_url:
      'https://${connection_settings.subdomain}.bamboohr.com/token.php',
    scope_separator: ' ',
    params_config: {
      authorize: {response_type: 'code', request: 'authorize'},
      token: {grant_type: 'authorization_code', request: 'token'},
    },
    openint_default_scopes: ['openid'],
    openint_allowed_scopes: ['openid', 'employee_records'],
    scopes: [
      {
        scope: 'openid',
        description:
          'Provides access to authenticate the user and retrieve basic user profile information (like user ID). This is the minimal scope needed for authentication.',
      },
      {
        scope: 'profile',
        description:
          'Provides access to basic employee profile information (name, email, job title, etc.) but not sensitive personal data.',
      },
      {
        scope: 'time_off',
        description:
          'Provides read access to employee time off requests and balances.',
      },
      {
        scope: 'time_off:write',
        description:
          'Provides write access to create and update time off requests.',
      },
      {
        scope: 'employee_records',
        description:
          'Provides read access to detailed employee records including sensitive information like SSN and salary data.',
      },
      {
        scope: 'employee_records:write',
        description:
          'Provides write access to update employee records including sensitive information.',
      },
      {
        scope: 'reports',
        description:
          'Provides access to generate and view custom reports in BambooHR.',
      },
      {
        scope: 'admin',
        description:
          'Provides full administrative access to all BambooHR features and data.',
      },
    ],
    connection_settings: z.object({
      subdomain: z
        .string()
        .regex(/https:\/\/([a-z0-9_-]+)\.bamboohr\.com/)
        .describe(
          'The subdomain of your BambooHR account (e.g., https://domain.bamboohr.com)',
        ),
    }),
  },
} satisfies JsonConnectorDef
