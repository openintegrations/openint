import type {JsonConnectorDef} from '../schema'

export default {
  audience: ['business'],
  verticals: ['ticketing'],
  display_name: 'Jira',
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
    openint_default_scopes: ['read:jira-user', 'read:jira-work'],
    openint_allowed_scopes: [
      'read:jira-user',
      'read:jira-work',
      'write:jira-work',
    ],
    /**
     * Go to: https://developer.atlassian.com/console/myapps/
     * Select OpenInt -> Permissions -> Click 'Config..' for Jira
     * Add the scopes as necessary
     */
    scopes: [
      {
        scope: 'read:jira-user',
        description:
          'View user information in Jira that the user has access to, including usernames, email addresses, and avatars',
      },
      {
        scope: 'read:jira-work',
        description:
          'Read Jira project and issue data, search for issues, and objects associated with issues like attachments and worklogs',
      },
      {
        scope: 'write:jira-work',
        description:
          'Create and edit issues in Jira, post comments as the user, create worklogs, and delete issues',
      },
      {
        scope: 'manage:jira-project',
        description:
          'Create and edit project settings and create new project-level objects (e.g. versions and components)',
      },
      {
        scope: 'manage:jira-configuration',
        description:
          'Take Jira administration actions (e.g. create projects and custom fields, view workflows, manage issue link types)',
      },
      {
        scope: 'manage:jira-webhook',
        description:
          'Fetch, register, refresh, and delete dynamically declared Jira webhooks',
      },
      {
        scope: 'manage:jira-data-provider',
        description:
          'Manage development and release information for third parties in Jira',
      },
      {
        scope: 'read:servicedesk-request',
        description:
          'Read customer request data, including approvals, attachments, comments, request participants, and status/transitions. Read service desk and request types, including searching for request types and reading request type fields, properties and groups',
      },
      {
        scope: 'manage:servicedesk-customer',
        description:
          'Create, manage and delete customers and organizations. Add and remove customers and organizations from service desks',
      },
      {
        scope: 'write:servicedesk-request',
        description:
          'Create and edit customer requests, including add comments and attachments, approve, share (add request participants), subscribe, and transition',
      },
      {
        scope: 'read:servicemanagement-insight-objects',
        description:
          'Read Insight object schemas, objects, and object attributes',
      },
      {
        scope: 'offline_access',
        description:
          'Allows obtaining refresh tokens for long-term access when user is not present',
      },
    ],
  },
} satisfies JsonConnectorDef
