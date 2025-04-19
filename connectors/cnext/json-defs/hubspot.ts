import type {JsonConnectorDef} from '../schema'

export default {
  audience: ['business'],
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
        scope: 'crm.objects.companies.read',
        description: 'Provides read-only access to company objects in the CRM.',
      },
      {
        scope: 'crm.objects.companies.write',
        description: 'Provides write access to company objects in the CRM.',
      },
      {
        scope: 'crm.objects.contacts.read',
        description: 'Provides read-only access to contact objects in the CRM.',
      },
      {
        scope: 'crm.objects.contacts.write',
        description: 'Provides write access to contact objects in the CRM.',
      },
      {
        scope: 'crm.objects.custom.read',
        description: 'Provides read-only access to custom objects in the CRM.',
      },
      {
        scope: 'crm.objects.custom.write',
        description: 'Provides write access to custom objects in the CRM.',
      },
      {
        scope: 'crm.objects.deals.read',
        description: 'Provides read-only access to deal objects in the CRM.',
      },
      {
        scope: 'crm.objects.deals.write',
        description: 'Provides write access to deal objects in the CRM.',
      },
      {
        scope: 'crm.objects.owners.read',
        description: 'Provides read-only access to owner objects in the CRM.',
      },
      {
        scope: 'crm.objects.users.read',
        description: 'Provides read-only access to user objects in the CRM.',
      },
      {
        scope: 'crm.objects.users.write',
        description: 'Provides write access to user objects in the CRM.',
      },
      {
        scope: 'crm.schemas.companies.read',
        description: 'Provides read-only access to company schemas in the CRM.',
      },
      {
        scope: 'crm.schemas.companies.write',
        description: 'Provides write access to company schemas in the CRM.',
      },
      {
        scope: 'crm.schemas.contacts.read',
        description: 'Provides read-only access to contact schemas in the CRM.',
      },
      {
        scope: 'crm.schemas.contacts.write',
        description: 'Provides write access to contact schemas in the CRM.',
      },
      {
        scope: 'crm.schemas.custom.read',
        description: 'Provides read-only access to custom schemas in the CRM.',
      },
      {
        scope: 'crm.schemas.custom.write',
        description: 'Provides write access to custom schemas in the CRM.',
      },
      {
        scope: 'crm.schemas.deals.read',
        description: 'Provides read-only access to deal schemas in the CRM.',
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
        scope: 'sales-email-read',
        description: 'Provides read-only access to sales email data.',
      },
      {
        scope: 'settings.users.read',
        description: 'Provides read-only access to user settings information.',
      },
      {
        scope: 'settings.users.teams.read',
        description:
          'Provides read-only access to user team settings information.',
      },
      {
        scope: 'settings.users.teams.write',
        description: 'Provides write access to user team settings information.',
      },
      {
        scope: 'settings.users.write',
        description: 'Provides write access to user settings information.',
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
    ],
  },
} satisfies JsonConnectorDef
