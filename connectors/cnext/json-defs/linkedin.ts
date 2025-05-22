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
    openint_default_scopes: ['profile', 'email', 'openid'],
    openint_allowed_scopes: ['profile', 'email', 'openid', 'r_basicprofile'],
    /**
     * https://learn.microsoft.com/en-us/linkedin/shared/authentication/getting-access
     * Review available scopes and add as necessary, we mostly use the default + marketing scopes.
     */
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
          "Member Auth: Read an authenticated member's basic profile including name, photo, headline, and public profile URL.",
      },
      {
        scope: 'email',
        description:
          "Provides access to the member's primary email address. Requires explicit member consent as it's considered sensitive information.",
      },
      {
        scope: 'w_member_social',
        description:
          'Member Auth: Post, comment, and like posts on behalf of an authenticated member.',
      },
      {
        scope: 'rw_organization_admin',
        description:
          "Member Auth: Manage an authenticated member's company pages and retrieve reporting data.",
      },
      {
        scope: 'r_organization_admin',
        description:
          "Member Auth: Retrieve an authenticated member's company pages and their reporting data.",
      },
      {
        scope: 'w_organization_social',
        description:
          'Member Auth: Post, comment and like posts on behalf of an organization. Restricted to organizations in which the authenticated member has one of the following company page roles: ADMINISTRATOR, DIRECT_SPONSORED_CONTENT_POSTER, LEAD_GEN_FORMS_MANAGER.',
      },
      {
        scope: 'r_organization_social',
        description:
          "Member Auth: Retrieve organizations' posts, comments, and likes.",
      },
      {
        scope: 'rw_ads',
        description:
          "Member Auth: Manage and read an authenticated member's ad accounts. Restricted to ad accounts in which the authenticated member has one of the following ad account roles: ACCOUNT_BILLING_ADMIN, ACCOUNT_MANAGER, CAMPAIGN_MANAGER, CREATIVE_MANAGER.",
      },
      {
        scope: 'r_ads',
        description:
          "Member Auth: Read an authenticated member's ad accounts. Restricted to ad accounts in which the authenticated member has one of the following ad account roles: ACCOUNT_BILLING_ADMIN, ACCOUNT_MANAGER, CAMPAIGN_MANAGER, CREATIVE_MANAGER, VIEWER.",
      },
      {
        scope: 'r_ads_reporting',
        description:
          'Member Auth: Retrieve reporting for advertising accounts.',
      },
      {
        scope: 'r_1st_connections_size',
        description:
          "Member Auth: Retrieve the count of an authenticated member's 1st-degree connections.",
      },
      {
        scope: 'r_marketing_leadgen_automation',
        description:
          'Member Auth: Access your lead generation forms and retrieve leads (including event leads, ad leads, and organization page leads).',
      },
      {
        scope: 'rw_dmp_segments',
        description: 'Member Auth: Create and manage matched audiences.',
      },
    ],
  },
} satisfies JsonConnectorDef
