import type {JsonConnectorDef} from '../schema'

export const jsonDef = {
  audience: ['business'],
  verticals: ['ticketing'],
  display_name: 'Jira (OAuth)',
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
    openint_scopes: ['read:jira-user'],
    scopes: [
      {
        scope: 'read:jira-user',
        description:
          'Allows read-only access to user profile information (name, email, avatar, etc.)',
      },
      {
        scope: 'read:jira-work',
        description:
          'Allows read access to Jira issues, projects, boards, and other work items',
      },
      {
        scope: 'write:jira-work',
        description:
          'Allows creating, updating, and transitioning Jira issues and work items',
      },
      {
        scope: 'manage:jira-project',
        description:
          'Allows administration of Jira projects including settings, components, and versions',
      },
      {
        scope: 'manage:jira-configuration',
        description: 'Allows modifying global Jira configurations and settings',
      },
      {
        scope: 'offline_access',
        description:
          'Allows obtaining refresh tokens for long-term access when user is not present',
      },
    ],
  },
} satisfies JsonConnectorDef
