import type {JsonConnectorDef} from '../schema'

export default {
  audience: ['business'],
  verticals: ['social-media'],
  display_name: 'Yandex',
  stage: 'alpha',
  version: 1,
  auth: {
    type: 'OAUTH2',
    authorization_request_url: 'https://oauth.yandex.com/authorize',
    token_request_url: 'https://oauth.yandex.com/token',
    scope_separator: ' ',
    params_config: {
      authorize: {response_type: 'code'},
      token: {grant_type: 'authorization_code'},
    },
    openint_default_scopes: ['login:info'],
    openint_allowed_scopes: ['login:info', 'login:email', 'cloud_api:disk.read', 'calendar'],
    scopes: [
      {
        scope: 'login:email',
        description: "Access to the user's primary email address",
      },
      {
        scope: 'login:info',
        description:
          "Basic read-only access to user's account information (name, login, profile picture)",
      },
      {
        scope: 'cloud_api:disk.read',
        description: 'Read-only access to Yandex.Disk files and metadata',
      },
      {
        scope: 'cloud_api:disk',
        description:
          'Full access to Yandex.Disk including read, write, and delete operations',
      },
      {
        scope: 'mail:imap',
        description: 'Access to IMAP protocol for Yandex.Mail',
      },
      {
        scope: 'mail:smpt',
        description:
          'Access to SMTP protocol for sending emails through Yandex.Mail',
      },
      {
        scope: 'calendar',
        description:
          'Full access to Yandex.Calendar including reading and modifying events',
      },
    ],
  },
} satisfies JsonConnectorDef
