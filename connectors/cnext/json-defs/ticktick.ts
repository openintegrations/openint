import type {JsonConnectorDef} from '../schema'

export default {
  audience: ['business'],
  verticals: ['ticketing'],
  display_name: 'TickTick',
  stage: 'alpha',
  version: 1,
  auth: {
    type: 'OAUTH2',
    authorization_request_url: 'https://ticktick.com/oauth/authorize',
    token_request_url: 'https://ticktick.com/oauth/token',
    scope_separator: ' ',
    params_config: {},
    openint_default_scopes: ['user:read'],
    openint_allowed_scopes: ['user:read', 'tasks:read'],
    scopes: [
      {
        scope: 'tasks:read',
        description: 'Read-only access to tasks and task lists',
      },
      {
        scope: 'tasks:write',
        description: 'Create, modify, and delete tasks and task lists',
      },
      {
        scope: 'user:read',
        description: 'Read access to basic user profile information',
      },
      {
        scope: 'projects:read',
        description: 'Read-only access to projects and project details',
      },
      {
        scope: 'projects:write',
        description: 'Create, modify, and delete projects',
      },
      {
        scope: 'full_access',
        description: 'Full access to all TickTick data and functions',
      },
    ],
  },
} satisfies JsonConnectorDef
