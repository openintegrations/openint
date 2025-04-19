import type {JsonConnectorDef} from '../schema'

export default {
  audience: ['business'],
  verticals: ['ats'],
  display_name: 'Lever',
  stage: 'ga',
  version: 1,
  auth: {
    type: 'OAUTH2',
    authorization_request_url: 'https://auth.lever.co/authorize',
    token_request_url: 'https://auth.lever.co/oauth/token',
    scope_separator: ' ',
    params_config: {
      authorize: {
        response_type: 'code',
        prompt: 'consent',
        audience: 'https://api.lever.co/v1',
      },
    },
    openint_scopes: ['read:applications'],
    scopes: [
      {
        scope: 'read',
        description:
          'Allows read-only access to all data in Lever, including candidates, postings, opportunities, and more. Does not permit any modifications.',
      },
      {
        scope: 'write',
        description:
          'Allows read and write access to all data in Lever, including creating, updating, and deleting candidates, postings, opportunities, etc.',
      },
      {
        scope: 'admin',
        description:
          'Provides full administrative access, including read/write permissions for all data and the ability to modify account settings and configurations.',
      },
      {
        scope: 'offline_access',
        description:
          "Allows the application to obtain refresh tokens for long-term access to Lever's API without requiring user re-authentication.",
      },
      {
        scope: 'read:applications',
        description:
          'Provides read-only access to job applications and related data, but no access to other candidate or posting information.',
      },
      {
        scope: 'read:candidates',
        description:
          'Provides read-only access to candidate profiles and related data, but no access to postings or opportunities.',
      },
      {
        scope: 'write:candidates',
        description:
          'Allows read and write access to candidate profiles and related data, including creating and updating candidates.',
      },
    ],
  },
} satisfies JsonConnectorDef
