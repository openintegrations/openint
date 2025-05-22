import type {JsonConnectorDef} from '../schema'

export default {
  audience: ['business'],
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
    openint_default_scopes: ['read:confluence-user', 'read:confluence-groups'],
    openint_allowed_scopes: [
      'read:confluence-user',
      'read:confluence-groups',
      'write:confluence-content',
    ],
    /**
     * Go to: https://developer.atlassian.com/console/myapps/
     * Select OpenInt -> Permissions -> Click 'Config..' for Confluence
     * Add the scopes as necessary
     */
    scopes: [
      {
        scope: 'write:confluence-content',
        description:
          'Permits the creation of pages, blogs, comments and questions',
      },
      {
        scope: 'read:confluence-space.summary',
        description: 'Read a summary of space information without expansions',
      },
      {
        scope: 'write:confluence-space',
        description: 'Create, update and delete space information',
      },
      {
        scope: 'write:confluence-file',
        description: 'Upload attachments',
      },
      {
        scope: 'read:confluence-props',
        description: 'Read content properties',
      },
      {
        scope: 'write:confluence-props',
        description: 'Write content properties',
      },
      {
        scope: 'manage:confluence-configuration',
        description: 'Manage global settings',
      },
      {
        scope: 'read:confluence-content.all',
        description:
          'Read all content, including content body (expansions permitted). Note, APIs using this scope may also return data allowed by read:confluence-space.summary. However, this scope is not a substitute for read:confluence-space.summary',
      },
      {
        scope: 'read:confluence-content.summary',
        description:
          'Read a summary of the content, which is the content without expansions. Note, APIs using this scope may also return data allowed by read:confluence-space.summary. However, this scope is not a substitute for read:confluence-space.summary',
      },
      {
        scope: 'search:confluence',
        description:
          'Search Confluence. Note, APIs using this scope may also return data allowed by read:confluence-space.summary and read:confluence-content.summary. However, this scope is not a substitute for read:confluence-space.summary or read:confluence-content.summary',
      },
      {
        scope: 'read:confluence-content.permission',
        description: 'View content permission in Confluence',
      },
      {
        scope: 'read:confluence-user',
        description:
          'View user information in Confluence that you have access to, including usernames, email adresses and profile pictures',
      },
      {
        scope: 'read:confluence-groups',
        description: 'Permits retrieval of user groups',
      },
      {
        scope: 'write:confluence-groups',
        description: 'Permits creation, removal and update of user groups',
      },
      {
        scope: 'readonly:content.attachment:confluence',
        description:
          'Download attachments of a Confluence page or blogpost that you have access to',
      },
    ],
  },
} satisfies JsonConnectorDef
