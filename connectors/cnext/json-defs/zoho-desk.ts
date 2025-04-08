import type {JsonConnectorDef} from '../schema'
import {z} from '@openint/util/zod-utils'

export const jsonDef = {
  audience: ['business'],
  verticals: ['ticketing'],
  display_name: 'Zoho Desk',
  stage: 'ga',
  version: 1,
  auth: {
    type: 'OAUTH2',
    authorization_request_url:
      'https://accounts.zoho.${connection_settings.extension}/oauth/v2/auth',
    token_request_url:
      'https://accounts.zoho.${connection_settings.extension}/oauth/v2/token',
    scope_separator: ' ',
    params_config: {authorize: {prompt: 'consent', access_type: 'offline'}},
    openint_scopes: ['ZohoDesk.basic.READ'],
    scopes: [
      {
        scope: 'ZohoDesk.tickets.READ',
        description: 'Allows read-only access to tickets in Zoho Desk',
      },
      {
        scope: 'ZohoDesk.tickets.CREATE',
        description: 'Allows creating new tickets in Zoho Desk',
      },
      {
        scope: 'ZohoDesk.tickets.UPDATE',
        description: 'Allows updating existing tickets in Zoho Desk',
      },
      {
        scope: 'ZohoDesk.tickets.DELETE',
        description: 'Allows deleting tickets in Zoho Desk',
      },
      {
        scope: 'ZohoDesk.contacts.READ',
        description: 'Allows read-only access to contacts in Zoho Desk',
      },
      {
        scope: 'ZohoDesk.basic.READ',
        description:
          'Allows read-only access to basic account information in Zoho Desk',
      },
      {
        scope: 'ZohoDesk.settings.READ',
        description: 'Allows read-only access to account settings in Zoho Desk',
      },
      {
        scope: 'ZohoDesk.tickets.ALL',
        description:
          'Provides full access (create, read, update, delete) to tickets in Zoho Desk',
      },
      {
        scope: 'ZohoDesk.accounts.READ',
        description:
          'Allows read-only access to account information in Zoho Desk',
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
