import {z} from '@openint/util/zod-utils'
import type {JsonConnectorDef} from '../schema'

export default {
  audience: ['business'],
  connector_name: 'salesforce',
  verticals: ['crm'],
  display_name: 'Salesforce',
  stage: 'ga',
  version: 1,
  auth: {
    type: 'OAUTH2',
    authorization_request_url:
      'https://login.salesforce.com/services/oauth2/authorize',
    token_request_url: 'https://login.salesforce.com/services/oauth2/token',
    scope_separator: ' ',
    params_config: {authorize: {prompt: 'consent'}},
    openint_scopes: ['offline_access'],
    scopes: [
      {
        scope: 'offline_access',
        description:
          'Allows the application to obtain a refresh token, which can be used to request new access tokens even when the user is not actively using the application. This enables long-term access to Salesforce resources on behalf of the user without requiring repeated authentication.',
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
