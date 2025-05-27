import type {JsonConnectorDef} from '../schema'

import {z} from '@openint/util/zod-utils'

export default {
  audience: ['business'],
  verticals: ['accounting'],
  display_name: 'Zoho',
  stage: 'alpha',
  version: 1,
  auth: {
    type: 'OAUTH2',
    authorization_request_url:
      'https://accounts.zoho.${connection_settings.extension}/oauth/v2/auth',
    token_request_url:
      'https://accounts.zoho.${connection_settings.extension}/oauth/v2/token',
    scope_separator: ' ',
    params_config: {authorize: {prompt: 'consent', access_type: 'offline'}},
    openint_default_scopes: ['aaaserver.profile.READ'],
    openint_allowed_scopes: [
      'aaaserver.profile.READ',
      'ZohoMail.accounts.READ',
      'ZohoCRM.modules.contacts.READ'
    ],
    scopes: [
      {
        scope: 'ZohoMail.accounts.READ',
        description: 'Read-only access to Zoho Mail account information',
      },
      {
        scope: 'ZohoMail.accounts.CREATE',
        description: 'Create new Zoho Mail accounts',
      },
      {
        scope: 'ZohoCRM.modules.ALL',
        description:
          'Full access to all Zoho CRM modules including read, write, delete, and import/export operations',
      },
      {
        scope: 'ZohoCRM.modules.contacts.READ',
        description: 'Read-only access to Zoho CRM contacts module',
      },
      {
        scope: 'ZohoCRM.settings.READ',
        description: 'Read-only access to Zoho CRM settings',
      },
      {
        scope: 'aaaserver.profile.READ',
        description: 'Read basic user profile information (email, name, etc.)',
      },
      {
        scope: 'ZohoBooks.fullaccess.all',
        description:
          'Full access to all Zoho Books operations including read, write, delete, and administrative functions',
      },
      {
        scope: 'ZohoBooks.invoices.READ',
        description: 'Read-only access to Zoho Books invoices',
      },
    ],
    connection_settings: z.object({
      extension: z
        .string()
        .regex(/https:\/\/accounts\.zoho\.([a-z.]+)\//)
        .describe(
          'The domain extension of your Zoho account (e.g., https://accounts.zoho.com/)',
        ),
    }),
  },
} satisfies JsonConnectorDef
