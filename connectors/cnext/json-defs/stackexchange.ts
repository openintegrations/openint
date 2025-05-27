import type {JsonConnectorDef} from '../schema'

export default {
  audience: ['business'],
  verticals: ['wiki', 'ticketing'],
  display_name: 'Stack Exchange',
  stage: 'alpha',
  version: 1,
  auth: {
    type: 'OAUTH2',
    authorization_request_url: 'https://stackoverflow.com/oauth',
    token_request_url: 'https://stackoverflow.com/oauth/access_token/json',
    scope_separator: ' ',
    params_config: {},
    openint_default_scopes: ['no_expiry'],
    openint_allowed_scopes: ['no_expiry', 'read_inbox'],
    scopes: [
      {
        scope: 'no_expiry',
        description:
          'This scope allows the access token to have an indefinite lifetime, meaning it will not expire unless explicitly revoked. This is typically used for applications that need long-lived access without requiring frequent re-authentication.',
      },
      {
        scope: 'read_inbox',
        description:
          "This scope provides access to read a user's inbox, including private messages and notifications on StackExchange sites.",
      },
      {
        scope: 'write_access',
        description:
          'This scope allows the application to perform write operations on behalf of the user, such as posting questions, answers, or comments.',
      },
      {
        scope: 'private_info',
        description:
          "This scope grants access to the user's private information, such as email addresses and other account details that are not publicly visible.",
      },
    ],
  },
} satisfies JsonConnectorDef
