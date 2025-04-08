import type {JsonConnectorDef} from '../schema'

export const jsonDef = {
  audience: ['business'],
  verticals: ['other'],
  display_name: 'Salesloft',
  stage: 'ga',
  version: 1,
  auth: {
    type: 'OAUTH2',
    authorization_request_url: 'https://accounts.salesloft.com/oauth/authorize',
    token_request_url: 'https://accounts.salesloft.com/oauth/token',
    scope_separator: ' ',
    params_config: {},
    openint_scopes: ['users:read'],
    scopes: [
      {
        scope: 'users:read',
        description:
          'Allows read-only access to user profile information (name, email, role, etc.) but no access to sales data or actions',
      },
      {
        scope: 'calls:read',
        description:
          'Provides access to read call recordings, transcripts, and metadata but cannot initiate calls or modify call data',
      },
      {
        scope: 'emails:read',
        description:
          'Grants permission to read email templates and sent email content but cannot send or modify emails',
      },
      {
        scope: 'people:read',
        description:
          'Allows reading contact/lead information in the CRM but no editing or creation capabilities',
      },
      {
        scope: 'cadences:read',
        description:
          'Provides read access to sales cadence workflows and sequences but cannot modify or execute them',
      },
      {
        scope: 'activities:write',
        description:
          'Enables creating and updating sales activities (calls, emails, meetings) in the system',
      },
      {
        scope: 'people:write',
        description:
          'Allows full create/read/update/delete operations on contact/lead records',
      },
      {
        scope: 'admin',
        description:
          'Provides full administrative access including user management, settings, and all data operations',
      },
    ],
  },
} satisfies JsonConnectorDef
