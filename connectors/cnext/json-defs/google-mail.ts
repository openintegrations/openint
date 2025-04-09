import type {JsonConnectorDef} from '../schema'

export default {
  audience: ['business'],
  verticals: ['other'],
  display_name: 'Gmail',
  stage: 'ga',
  version: 1,
  auth: {
    type: 'OAUTH2',
    authorization_request_url: 'https://accounts.google.com/o/oauth2/v2/auth',
    token_request_url: 'https://oauth2.googleapis.com/token',
    scope_separator: ' ',
    params_config: {
      authorize: {
        response_type: 'code',
        access_type: 'offline',
        prompt: 'consent',
      },
    },
    openint_scopes: ['https://www.googleapis.com/auth/gmail.metadata'],
    scopes: [
      {
        scope: 'https://www.googleapis.com/auth/gmail.readonly',
        description:
          "Allows read-only access to the user's Gmail data, including viewing messages and threads but not making any changes.",
      },
      {
        scope: 'https://www.googleapis.com/auth/gmail.send',
        description:
          'Allows sending messages only, without access to read, modify, or delete messages.',
      },
      {
        scope: 'https://www.googleapis.com/auth/gmail.compose',
        description:
          "Allows creating, reading, and sending messages (including drafts), but doesn't allow access to existing messages in the inbox.",
      },
      {
        scope: 'https://www.googleapis.com/auth/gmail.insert',
        description:
          "Allows inserting messages into the user's mailbox (e.g., importing email) but doesn't allow reading or modifying existing messages.",
      },
      {
        scope: 'https://www.googleapis.com/auth/gmail.labels',
        description:
          'Allows creating, reading, and modifying labels only, without access to message content.',
      },
      {
        scope: 'https://www.googleapis.com/auth/gmail.metadata',
        description:
          'Allows access to message metadata (headers, labels) but not the message body or attachments. This is the most limited read-only scope.',
      },
      {
        scope: 'https://www.googleapis.com/auth/gmail.modify',
        description:
          'Allows reading, sending, deleting, and modifying messages and threads (includes all actions of readonly, send, and compose).',
      },
      {
        scope: 'https://mail.google.com/',
        description:
          "Full access to the user's Gmail account, including all read and write operations. Equivalent to gmail.modify plus additional capabilities.",
      },
    ],
  },
} satisfies JsonConnectorDef
