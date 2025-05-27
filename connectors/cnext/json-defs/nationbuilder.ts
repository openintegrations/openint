import type {JsonConnectorDef} from '../schema'

import {z} from '@openint/util/zod-utils'

export default {
  audience: ['business'],
  verticals: ['other'],
  display_name: 'NationBuilder',
  stage: 'alpha',
  version: 1,
  auth: {
    type: 'OAUTH2',
    authorization_request_url:
      'https://${connection_settings.accountId}.nationbuilder.com/oauth/authorize',
    token_request_url:
      'https://${connection_settings.accountId}.nationbuilder.com/oauth/token',
    scope_separator: ' ',
    params_config: {
      authorize: {response_type: 'code'},
      token: {grant_type: 'authorization_code'},
    },
    openint_default_scopes: ['basic', 'public'],
    openint_allowed_scopes: ['basic', 'public'],
    scopes: [
      {
        scope: 'public',
        description:
          'Allows read-only access to public data (e.g., public site content, events, and basic people data). This is the smallest surface area scope as it provides the least privileges.',
      },
      {
        scope: 'basic',
        description:
          'Allows access to basic profile information of the authenticated user (e.g., name, email, and profile picture). This scope is mandatory for most authorization flows.',
      },
      {
        scope: 'website',
        description:
          'Allows read and write access to website-related data (e.g., pages, blog posts, and events).',
      },
      {
        scope: 'people',
        description:
          'Allows read and write access to people data (e.g., profiles, contact information, and tags).',
      },
      {
        scope: 'events',
        description:
          'Allows read and write access to event data (e.g., creating, updating, and managing events).',
      },
      {
        scope: 'donations',
        description:
          'Allows read and write access to donation data (e.g., donor information, donation amounts, and payment methods).',
      },
      {
        scope: 'signup',
        description:
          'Allows the creation of new signups (e.g., new user registrations).',
      },
      {
        scope: 'sites',
        description:
          'Allows read and write access to site-level data (e.g., site settings and configurations).',
      },
      {
        scope: 'admin',
        description:
          'Allows full administrative access to all data and settings (e.g., site-wide configurations, user permissions, and sensitive data). This scope has the largest surface area.',
      },
    ],
    connection_settings: z.object({
      accountId: z
        .string()
        .describe(
          'The account ID of your NationBuilder account (e.g., example-subdomain)',
        ),
    }),
  },
} satisfies JsonConnectorDef
