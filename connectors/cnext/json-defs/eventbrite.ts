import type {JsonConnectorDef} from '../schema'

export default {
  audience: ['business'],
  verticals: ['other'],
  display_name: 'Eventbrite',
  stage: 'alpha',
  version: 1,
  auth: {
    type: 'OAUTH2',
    authorization_request_url: 'https://www.eventbrite.com/oauth/authorize',
    token_request_url: 'https://www.eventbrite.com/oauth/token',
    scope_separator: ' ',
    params_config: {
      authorize: {response_type: 'code'},
      token: {grant_type: 'authorization_code'},
    },
    openint_default_scopes: ['basic'],
    openint_allowed_scopes: ['basic', 'user:read', 'event:read', 'orders:read'],
    scopes: [
      {
        scope: 'user:read',
        description:
          'Read-only access to basic user information (name, email, etc.)',
      },
      {
        scope: 'user:write',
        description: 'Read and write access to user information',
      },
      {
        scope: 'event:read',
        description: 'Read-only access to event information',
      },
      {
        scope: 'event:write',
        description: 'Read and write access to event information',
      },
      {
        scope: 'orders:read',
        description: 'Read-only access to order information',
      },
      {
        scope: 'organizations:read',
        description: 'Read-only access to organization information',
      },
      {
        scope: 'organizations:write',
        description: 'Read and write access to organization information',
      },
      {
        scope: 'basic',
        description:
          'Minimal read-only access required for authentication flows',
      },
    ],
  },
} satisfies JsonConnectorDef
