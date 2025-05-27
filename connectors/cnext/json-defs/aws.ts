import type {JsonConnectorDef} from '../schema'

import {z} from '@openint/util/zod-utils'

export default {
  audience: ['business'],
  verticals: ['developer-tools', 'commerce'],
  display_name: 'AWS',
  stage: 'alpha',
  version: 1,
  auth: {
    type: 'OAUTH2',
    authorization_request_url:
      'https://${connection_settings.subdomain}.auth.${connection_settings.extension}.amazoncognito.com/oauth2/authorize',
    token_request_url:
      'https://${connection_settings.subdomain}.auth.${connection_settings.extension}.amazoncognito.com/oauth2/token',
    scope_separator: ' ',
    params_config: {token: {grant_type: 'authorization_code'}},
    openint_default_scopes: ['openid'],
    openint_allowed_scopes: ['openid', 'phone'],
    scopes: [
      {
        scope: 'openid',
        description:
          "Allows the application to verify the user's identity and get basic profile information. This scope is required for OpenID Connect flows and enables the return of an ID token.",
      },
      {
        scope: 'aws.cognito.signin.user.admin',
        description:
          'Allows the application to perform administrative actions on behalf of the user, such as updating user attributes or deleting the user.',
      },
      {
        scope: 'email',
        description:
          "Allows the application to access the user's email address.",
      },
      {
        scope: 'profile',
        description:
          "Allows the application to access the user's basic profile information, such as name and picture.",
      },
      {
        scope: 'phone',
        description:
          "Allows the application to access the user's phone number.",
      },
    ],
    connection_settings: z.object({
      subdomain: z
        .string()
        .regex(/https:\/\/([a-z0-9_-]+)\.amazoncognito\.com/)
        .describe(
          'The subdomain of your AWS account (e.g., https://domain.amazoncognito.com)',
        ),
      extension: z
        .string()
        .regex(/[a-z.]+/)
        .describe('The domain extension of your AWS account (e.g., com)'),
      apiSubdomain: z
        .string()
        .regex(/https:\/\/cognito-([a-z.-]+)\.amazonaws\.com/)
        .describe(
          'The API subdomain to the API you want to connect to (e.g., https://cognito-idp.us-east-2.amazonaws.com)',
        ),
    }),
  },
} satisfies JsonConnectorDef
