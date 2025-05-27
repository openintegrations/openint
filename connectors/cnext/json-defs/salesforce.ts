import type {JsonConnectorDef} from '../schema'

import {z} from '@openint/util/zod-utils'

export default {
  audience: ['business'],
  verticals: ['crm'],
  display_name: 'Salesforce',
  stage: 'alpha',
  version: 1,
  auth: {
    type: 'OAUTH2',
    authorization_request_url:
      'https://login.salesforce.com/services/oauth2/authorize',
    token_request_url: 'https://login.salesforce.com/services/oauth2/token',
    scope_separator: ' ',
    params_config: {authorize: {prompt: 'consent'}},
    openint_default_scopes: ['openid', 'offline_access'],
    openint_allowed_scopes: ['openid', 'offline_access', 'id', 'refresh_token'],
    scopes: [
      {
        scope: 'openid',
        description:
          "Provides access to the user's identity and basic profile information through OpenID Connect. This scope is required for authentication flows when using OpenID Connect with Salesforce.",
      },
      {
        scope: 'offline_access',
        description:
          'Allows the application to obtain a refresh token, which can be used to request new access tokens without requiring user interaction. This enables long-lived access to Salesforce resources even when the user is not actively using the application.',
      },
      {
        scope: 'api',
        description:
          'Provides access to the Salesforce REST API, allowing the application to perform CRUD operations on standard and custom objects, execute queries, and access other API endpoints.',
      },
      {
        scope: 'refresh_token',
        description:
          "Synonymous with 'offline_access' in Salesforce. Allows the application to obtain a refresh token for long-lived access.",
      },
      {
        scope: 'id',
        description:
          "Provides access to the user's unique identifier (sub claim) and basic profile information. This scope has a smaller surface area than 'openid' as it does not include all OpenID Connect claims.",
      },
      {
        scope: 'profile',
        description:
          "Provides access to the user's full profile information, including name, email, and other attributes. This scope has a broader surface area than 'id' but is narrower than 'openid'.",
      },
      {
        scope: 'full',
        description:
          "Provides full access to the user's Salesforce instance, including all data and functionality. This scope has the largest surface area and should be used with caution.",
      },
    ],
    connection_settings: z.object({
      instance_url: z
        .string()
        .regex(/https?:\/\/.*/)
        .describe(
          'The instance URL of your Salesforce account (e.g., example)',
        ),
    }),
  },
} satisfies JsonConnectorDef
