import type {JsonConnectorDef} from '../schema'

export default {
  audience: ['business'],
  verticals: ['crm'],
  display_name: 'Copper (OAuth)',
  stage: 'alpha',
  version: 1,
  auth: {
    type: 'OAUTH2',
    authorization_request_url: 'https://app.copper.com/oauth/authorize',
    token_request_url: 'https://app.copper.com/oauth/token',
    scope_separator: ' ',
    params_config: {
      authorize: {response_type: 'code'},
      token: {grant_type: 'authorization_code'},
    },
    openint_default_scopes: ['developer/v1/me'],
    openint_allowed_scopes: ['developer/v1/me', 'developer/v1/read_only'],
    scopes: [
      {
        scope: 'developer/v1/all',
        description:
          'Provides full access to all Copper API endpoints, including read and write operations for all resources (e.g., people, companies, opportunities, tasks, and custom fields). This is the broadest scope with the highest privileges.',
      },
      {
        scope: 'developer/v1/read_only',
        description:
          'Provides read-only access to all Copper API endpoints. This scope allows viewing data but does not permit creating, updating, or deleting resources.',
      },
      {
        scope: 'developer/v1/me',
        description:
          "Provides access only to the authenticated user's own profile information. This is the smallest surface area scope, as it limits access to just the user's own data.",
      },
    ],
  },
} satisfies JsonConnectorDef
