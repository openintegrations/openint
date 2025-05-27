import type {JsonConnectorDef} from '../schema'

export default {
  audience: ['business'],
  verticals: ['other'],
  display_name: 'Smartsheet',
  stage: 'alpha',
  version: 1,
  auth: {
    type: 'OAUTH2',
    authorization_request_url: 'https://app.smartsheet.com/b/authorize',
    token_request_url: 'https://api.smartsheet.com/2.0/token',
    scope_separator: ' ',
    params_config: {
      authorize: {response_type: 'code'},
      token: {grant_type: 'authorization_code'},
    },
    openint_default_scopes: ['offline_access'],
    openint_allowed_scopes: ['offline_access', 'READ_USERS', 'READ_SHEETS'],
    scopes: [
      {
        scope: 'READ_SHEETS',
        description:
          'Allows read-only access to sheets, reports, dashboards, and their data. This includes viewing sheet structures, rows, columns, and cell data but no modifications are permitted.',
      },
      {
        scope: 'WRITE_SHEETS',
        description:
          "Provides create and update access to sheets, rows, and columns. This includes adding/editing rows, columns, and cell data, but doesn't include admin-level operations like sheet deletion.",
      },
      {
        scope: 'SHARE_SHEETS',
        description:
          'Allows sharing and permission management for sheets, reports, and dashboards. This includes adding/removing collaborators and changing access levels.',
      },
      {
        scope: 'DELETE_SHEETS',
        description:
          'Grants permission to delete sheets, reports, and dashboards. This is a powerful scope that should be used cautiously.',
      },
      {
        scope: 'CREATE_SHEETS',
        description:
          'Allows creation of new sheets, reports, and dashboards. Does not include permissions to modify or delete existing items.',
      },
      {
        scope: 'ADMIN_SHEETS',
        description:
          'Provides full administrative access to all sheet operations including create, read, update, delete, and share. This is the most permissive scope.',
      },
      {
        scope: 'READ_USERS',
        description:
          'Allows read-only access to user information including profile details and organization membership. This is the scope with the smallest surface area as it only accesses user metadata.',
      },
      {
        scope: 'ADMIN_USERS',
        description:
          'Provides full access to user management including inviting, modifying, and removing users from the organization. Requires system admin privileges.',
      },
      {
        scope: 'offline_access',
        description:
          'Required for obtaining a refresh token that allows long-term access when the user is not actively using the application. This is mandatory for most authorization flows that require persistent access.',
      },
    ],
  },
} satisfies JsonConnectorDef
