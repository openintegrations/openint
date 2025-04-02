import {generateOauthConnectorDef} from '../_defaults/oauth2/schema'
import type {JsonConnectorDef} from '../def'

export const jsonDef = {
  audience: ['business'],
  connector_name: 'linear',
  verticals: ['ticketing'],
  display_name: 'Linear',
  stage: 'ga',
  version: 1,
  auth: {
    type: 'OAUTH2',
    authorization_request_url: 'https://linear.app/oauth/authorize',
    token_request_url: 'https://api.linear.app/oauth/token',
    scope_separator: ',',
    params_config: {authorize: {prompt: 'consent'}},
    openint_scopes: ['user:read'],
    scopes: [
      {
        scope: 'read',
        description:
          'Allows read-only access to your Linear data, including issues, projects, and teams. This scope does not permit any modifications.',
      },
      {
        scope: 'write',
        description:
          "Allows creating, updating, and deleting Linear data, including issues, projects, and teams. This scope includes all permissions granted by the 'read' scope.",
      },
      {
        scope: 'admin',
        description:
          "Provides full access to all Linear data and administrative actions, including team settings and user management. This scope includes all permissions granted by the 'read' and 'write' scopes.",
      },
      {
        scope: 'user:read',
        description:
          'Allows read-only access to user-specific data, such as your profile information and assigned issues. This scope does not permit access to team or project data beyond what is assigned to you.',
      },
      {
        scope: 'issues:read',
        description:
          "Allows read-only access to issues in Linear, including their comments and attachments. This scope is more specific than the general 'read' scope.",
      },
      {
        scope: 'issues:write',
        description:
          "Allows creating, updating, and deleting issues in Linear. This scope includes all permissions granted by the 'issues:read' scope.",
      },
      {
        scope: 'projects:read',
        description:
          'Allows read-only access to projects in Linear, including their settings and issue lists. This scope does not permit modifications.',
      },
      {
        scope: 'teams:read',
        description:
          'Allows read-only access to teams in Linear, including their members and settings. This scope does not permit modifications.',
      },
    ],
  },
} satisfies JsonConnectorDef

export const def = generateOauthConnectorDef(jsonDef)
