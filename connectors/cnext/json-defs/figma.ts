import type {JsonConnectorDef} from '../schema'

export default {
  audience: ['business'],
  verticals: ['other'],
  display_name: 'Figma',
  stage: 'alpha',
  version: 1,
  auth: {
    type: 'OAUTH2',
    authorization_request_url: 'https://www.figma.com/oauth',
    token_request_url: 'https://api.figma.com/v1/oauth/token',
    scope_separator: ',',
    params_config: {},
    openint_default_scopes: ['offline_access'],
    openint_allowed_scopes: ['offline_access', 'file_read'],
    scopes: [
      {
        scope: 'file_read',
        description:
          "Allows read-only access to Figma files and their contents. This includes viewing file metadata, components, and comments, but doesn't permit any modifications.",
      },
      {
        scope: 'file_write',
        description:
          'Provides read and write access to Figma files, including the ability to create, modify, and delete file contents, components, and comments.',
      },
      {
        scope: 'team_read',
        description:
          "Grants read-only access to team information, including team projects, members, and their roles, but doesn't allow any modifications.",
      },
      {
        scope: 'offline_access',
        description:
          "Allows the application to access the API on behalf of the user when they're not actively using the application, using refresh tokens.",
      },
      {
        scope: 'webhooks',
        description:
          'Enables the application to manage webhooks for Figma files and teams, including creating, viewing, and deleting webhooks.',
      },
    ],
  },
} satisfies JsonConnectorDef
