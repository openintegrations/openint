import type {JsonConnectorDef} from '../schema'

export default {
  audience: ['business'],
  verticals: ['ats', 'social-media'],
  display_name: 'LinkedIn',
  stage: 'ga',
  version: 1,
  auth: {
    type: 'OAUTH2',
    authorization_request_url:
      'https://www.linkedin.com/oauth/v2/authorization',
    token_request_url: 'https://www.linkedin.com/oauth/v2/accessToken',
    scope_separator: ' ',
    params_config: {},
    openint_scopes: ['profile', 'email', 'openid'],
    scopes: [
      {
        scope: 'profile',
        description:
          "Provides access to the member's basic profile information including name, photo, headline, and current positions. This is a limited subset of profile data compared to 'r_basicprofile'.",
      },
      {
        scope: 'openid',
        description:
          'Enables user authentication and allows the application to receive a unique identifier for the user. This scope is required for OpenID Connect authentication flows and provides basic identity information about the authenticated user.',
      },
      {
        scope: 'r_basicprofile',
        description:
          "Provides access to the member's full basic profile including experience, education, skills, and recommendations. More extensive than 'r_liteprofile' but doesn't include sensitive information.",
      },
      {
        scope: 'email',
        description:
          "Provides access to the member's primary email address. Requires explicit member consent as it's considered sensitive information.",
      },
      {
        scope: 'w_member_social',
        description:
          'Allows the application to post, comment, and like posts on behalf of the member. Also enables sharing content to LinkedIn.',
      },
      {
        scope: 'rw_organization_admin',
        description:
          'Provides read-write access to organization pages that the member can administer. Allows managing company pages, posting updates, etc.',
      },
      {
        scope: 'r_organization_social',
        description:
          'Provides read access to organization posts and engagement statistics for organizations the member can access.',
      },
      {
        scope: 'r_ads',
        description:
          "Provides access to LinkedIn's Advertising APIs, allowing reading of ad accounts, campaigns, and analytics.",
      },
      {
        scope: 'w_organization_social',
        description:
          'Allows posting content, comments, and likes on behalf of organizations the member can administer.',
      },
    ],
  },
} satisfies JsonConnectorDef
