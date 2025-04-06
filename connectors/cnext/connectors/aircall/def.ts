import {generateOauthConnectorDef} from '../../oauth2/schema'
import type {JsonConnectorDef} from '../../def'

export const jsonDef = {
  audience: ['business'],
  connector_name: 'aircall',
  verticals: ['ticketing'],
  display_name: 'Aircall (OAuth)',
  stage: 'ga',
  version: 1,
  auth: {
    type: 'OAUTH2',
    authorization_request_url: 'https://dashboard.aircall.io/oauth/authorize',
    token_request_url: 'https://api.aircall.io/v1/oauth/token',
    scope_separator: ' ',
    params_config: {
      authorize: {response_type: 'code', scope: 'public_api'},
      token: {grant_type: 'authorization_code'},
    },
    openint_scopes: ['contacts.read'],
    scopes: [
      {
        scope: 'public_api',
        description:
          'Provides access to public API endpoints, typically read-only access to non-sensitive data.',
      },
      {
        scope: 'users.read',
        description:
          'Allows read-only access to user information such as names, emails, and basic profile data.',
      },
      {
        scope: 'calls.read',
        description:
          'Provides read-only access to call data including call logs, durations, and participants.',
      },
      {
        scope: 'contacts.read',
        description:
          'Allows read-only access to contact information in the Aircall directory.',
      },
      {
        scope: 'numbers.read',
        description:
          'Provides read-only access to phone number information associated with the account.',
      },
      {
        scope: 'calls.write',
        description:
          'Allows creating and modifying calls, including initiating new calls and updating call statuses.',
      },
      {
        scope: 'users.write',
        description:
          'Provides full access to user data, including creating, updating, and deleting user accounts.',
      },
      {
        scope: 'admin',
        description:
          'Grants full administrative access to all account features and data, including sensitive operations.',
      },
    ],
  },
} satisfies JsonConnectorDef

export const def = generateOauthConnectorDef(jsonDef)
