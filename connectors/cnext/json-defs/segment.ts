import type {JsonConnectorDef} from '../schema'

export default {
  audience: ['business'],
  verticals: ['other'],
  display_name: 'Segment',
  stage: 'alpha',
  version: 1,
  auth: {
    type: 'OAUTH2',
    authorization_request_url: 'https://id.segmentapis.com/oauth2/auth',
    token_request_url: 'https://id.segmentapis.com/oauth2/token',
    scope_separator: ' ',
    params_config: {},
    openint_default_scopes: ['profile', 'identify'],
    openint_allowed_scopes: ['profile', 'identify', 'read:events'],
    scopes: [
      {
        scope: 'profile',
        description:
          'Access to basic user profile information, including name, email, and other personal details.',
      },
      {
        scope: 'track',
        description:
          'Allows the application to send track events to Segment on behalf of the user.',
      },
      {
        scope: 'identify',
        description:
          'Allows the application to send identify calls to Segment to manage user identities.',
      },
      {
        scope: 'read:events',
        description: 'Allows the application to read event data from Segment.',
      },
      {
        scope: 'write:events',
        description:
          'Allows the application to create and modify event data in Segment.',
      },
      {
        scope: 'admin',
        description:
          'Full administrative access to all resources in the Segment workspace, including the ability to manage sources, destinations, and settings.',
      },
    ],
  },
} satisfies JsonConnectorDef
