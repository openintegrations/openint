import {generateOauthConnectorDef} from '../../_defaults/oauth2/schema'
import type {JsonConnectorDef} from '../../def'

export const jsonDef = {
  audience: ['business'],
  connector_name: 'hubspot',
  verticals: ['ticketing', 'crm'],
  display_name: 'HubSpot',
  stage: 'ga',
  version: 1,
  auth: {
    type: 'OAUTH2',
    authorization_request_url: 'https://app.hubspot.com/oauth/authorize',
    token_request_url: 'https://api.hubapi.com/oauth/v1/token',
    scope_separator: ' ',
    params_config: {},
    openint_scopes: ['crm.objects.contacts.read'],
    scopes: [
      {
        scope: 'contacts',
        description:
          'Provides read and write access to all contacts and contact properties in HubSpot.',
      },
      {
        scope: 'contacts-ro',
        description:
          'Provides read-only access to contacts and contact properties in HubSpot.',
      },
      {
        scope: 'content',
        description:
          'Provides read and write access to content, including blog posts, pages, and templates.',
      },
      {
        scope: 'forms',
        description:
          'Provides read and write access to forms and form submissions.',
      },
      {
        scope: 'forms-ro',
        description: 'Provides read-only access to forms and form submissions.',
      },
      {
        scope: 'oauth',
        description: "Allows the app to make OAuth requests to HubSpot's API.",
      },
      {
        scope: 'timeline',
        description:
          'Provides read and write access to timeline events for objects.',
      },
      {
        scope: 'tickets',
        description: 'Provides read and write access to tickets in HubSpot.',
      },
      {
        scope: 'tickets-ro',
        description: 'Provides read-only access to tickets in HubSpot.',
      },
      {
        scope: 'e-commerce',
        description:
          'Provides read and write access to e-commerce data including products, line items, and orders.',
      },
      {
        scope: 'files',
        description: 'Provides read and write access to files in HubSpot.',
      },
      {
        scope: 'files-ro',
        description: 'Provides read-only access to files in HubSpot.',
      },
      {
        scope: 'automation',
        description: 'Provides access to workflow automation features.',
      },
      {
        scope: 'integration-sync',
        description:
          'Allows for syncing data between HubSpot and external systems.',
      },
      {
        scope: 'crm.objects.contacts.read',
        description: 'Provides read-only access to contact objects in the CRM.',
      },
      {
        scope: 'crm.schemas.contacts.read',
        description: 'Provides read-only access to contact schemas in the CRM.',
      },
      {
        scope: 'settings.users.read',
        description: 'Provides read-only access to user settings information.',
      },
    ],
  },
} satisfies JsonConnectorDef

export const def = generateOauthConnectorDef(jsonDef)
