import type {JsonConnectorDef} from '../schema'

import {z} from '@openint/util/zod-utils'

export default {
  audience: ['business'],
  verticals: ['accounting'],
  display_name: 'NetSuite (OAuth)',
  stage: 'alpha',
  version: 1,
  auth: {
    type: 'OAUTH2',
    authorization_request_url:
      'https://${connection_settings.accountId}.app.netsuite.com/app/login/oauth2/authorize.nl',
    token_request_url:
      'https://${connection_settings.accountId}.suitetalk.api.netsuite.com/services/rest/auth/oauth2/v1/token',
    scope_separator: ' ',
    params_config: {authorize: {prompt: 'consent'}},
    openint_default_scopes: ['rest_webservices'],
    openint_allowed_scopes: ['rest_webservices', 'restlets'],
    scopes: [
      {
        scope: 'rest_webservices',
        description:
          "Provides access to NetSuite's REST web services, allowing the application to perform CRUD operations on records, execute SuiteQL queries, and interact with SuiteScript RESTlets. This scope is required for any application that needs to interact with NetSuite's REST API.",
      },
      {
        scope: 'restlets',
        description:
          'Provides access to SuiteScript RESTlets, allowing the application to execute custom server-side scripts. This scope is more limited than rest_webservices as it only allows interaction with predefined RESTlets rather than full REST API access.',
      },
    ],
    connection_settings: z.object({
      accountId: z
        .string()
        .regex(/[a-zA-Z0-9-_]+/)
        .describe(
          'The account ID of your NetSuite account (e.g., tstdrv231585)',
        ),
    }),
  },
} satisfies JsonConnectorDef
