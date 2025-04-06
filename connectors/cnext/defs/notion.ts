import {generateOauthConnectorDef} from '../../oauth2/schema'
import type {JsonConnectorDef} from '../../def'

export const jsonDef = {
  audience: ['business'],
  connector_name: 'notion',
  verticals: ['wiki'],
  display_name: 'Notion',
  stage: 'ga',
  version: 1,
  auth: {
    type: 'OAUTH2',
    authorization_request_url: 'https://api.notion.com/v1/oauth/authorize',
    token_request_url: 'https://api.notion.com/v1/oauth/token',
    scope_separator: ' ',
    params_config: {authorize: {response_type: 'code', owner: 'user'}},
    openint_scopes: ['user:read'],
    scopes: [
      {
        scope: 'user:read',
        description:
          "Allows the application to read user information, such as the user's name, email, and profile picture. This is a read-only scope with no write permissions.",
      },
      {
        scope: 'user:write',
        description:
          "Allows the application to update user information, such as the user's name or profile picture. This includes the permissions of user:read.",
      },
      {
        scope: 'content:read',
        description:
          'Allows the application to read all content that the user has access to in Notion, including pages, databases, and blocks. This is a read-only scope.',
      },
      {
        scope: 'content:write',
        description:
          'Allows the application to create, update, and delete content in Notion, including pages, databases, and blocks. This includes the permissions of content:read.',
      },
      {
        scope: 'workspace:read',
        description:
          'Allows the application to read workspace information, such as the workspace name, settings, and members. This is a read-only scope.',
      },
      {
        scope: 'workspace:write',
        description:
          'Allows the application to update workspace information, such as settings and members. This includes the permissions of workspace:read.',
      },
    ],
  },
} satisfies JsonConnectorDef

export const def = generateOauthConnectorDef(jsonDef)
