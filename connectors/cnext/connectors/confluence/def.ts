import {generateOauthConnectorDef} from '../../_defaults/oauth2/schema'
import type {JsonConnectorDef} from '../../def'

export const jsonDef = {
  audience: ['business'],
  connector_name: 'confluence',
  verticals: ['wiki'],
  display_name: 'Confluence',
  stage: 'ga',
  version: 1,
  auth: {
    type: 'OAUTH2',
    authorization_request_url: 'https://auth.atlassian.com/authorize',
    token_request_url: 'https://auth.atlassian.com/oauth/token',
    scope_separator: ' ',
    params_config: {
      authorize: {audience: 'api.atlassian.com', prompt: 'consent'},
    },
    openint_scopes: ['read:confluence-user'],
    scopes: [
      {
        scope: 'read:confluence-content',
        description:
          'Allows read-only access to Confluence content including pages, blog posts, and attachments',
      },
      {
        scope: 'write:confluence-content',
        description:
          'Provides read and write access to Confluence content including creating, updating, and deleting pages, blog posts, and attachments',
      },
      {
        scope: 'read:confluence-space',
        description:
          'Grants read-only access to space information and metadata',
      },
      {
        scope: 'read:confluence-user',
        description:
          'Provides read-only access to basic user profile information',
      },
      {
        scope: 'read:confluence-props',
        description: 'Allows reading content properties and metadata',
      },
      {
        scope: 'write:confluence-props',
        description:
          'Allows reading and writing content properties and metadata',
      },
      {
        scope: 'read:confluence-groups',
        description:
          'Provides read-only access to group membership information',
      },
      {
        scope: 'manage:confluence-space',
        description:
          'Grants full control over spaces including permissions and settings',
      },
    ],
  },
} satisfies JsonConnectorDef

export const def = generateOauthConnectorDef(jsonDef)
