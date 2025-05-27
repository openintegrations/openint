import type {JsonConnectorDef} from '../schema'

export default {
  audience: ['business'],
  verticals: ['ticketing'],
  display_name: 'Todoist',
  stage: 'alpha',
  version: 1,
  auth: {
    type: 'OAUTH2',
    authorization_request_url: 'https://todoist.com/oauth/authorize',
    token_request_url: 'https://todoist.com/oauth/access_token',
    scope_separator: ',',
    params_config: {},
    openint_default_scopes: ['user:read'],
    openint_allowed_scopes: ['user:read', 'data:read'],
    scopes: [
      {
        scope: 'task:add',
        description:
          "Allows the application to create new tasks in the user's Todoist account.",
      },
      {
        scope: 'data:read',
        description:
          "Allows read-only access to the user's projects, tasks, and other data in Todoist.",
      },
      {
        scope: 'data:read_write',
        description:
          "Allows full read and write access to the user's projects, tasks, and other data in Todoist.",
      },
      {
        scope: 'project:delete',
        description:
          "Allows the application to delete projects in the user's Todoist account.",
      },
      {
        scope: 'user:read',
        description:
          "Allows read-only access to the user's profile information in Todoist.",
      },
    ],
  },
} satisfies JsonConnectorDef
