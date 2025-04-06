import type {JsonConnectorDef} from '../schema'

export default {
  audience: ['business'],
  connector_name: 'googlemail',
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
          "Allows read-only access to the user's Gmail account, including viewing messages and threads but not sending, deleting, or modifying them.",
      },
      {
        scope: 'https://www.googleapis.com/auth/gmail.send',
        description:
          "Allows sending emails on behalf of the user but doesn't provide access to read, modify, or delete existing emails.",
      },
      {
        scope: 'https://www.googleapis.com/auth/gmail.labels',
        description:
          "Allows creating, modifying, and deleting Gmail labels but doesn't provide access to email content.",
      },
      {
        scope: 'https://www.googleapis.com/auth/gmail.insert',
        description:
          "Allows inserting emails into the user's mailbox (e.g., for archiving purposes) but doesn't allow reading existing emails or sending new ones.",
      },
      {
        scope: 'https://www.googleapis.com/auth/gmail.modify',
        description:
          "Allows reading, sending, and modifying emails, including changing labels and thread state, but doesn't allow permanent deletion.",
      },
      {
        scope: 'https://www.googleapis.com/auth/gmail.compose',
        description:
          "Allows creating and drafting emails but doesn't provide access to read or modify existing emails.",
      },
      {
        scope: 'https://www.googleapis.com/auth/gmail.metadata',
        description:
          'Allows access to email headers (metadata) like subject, sender, recipients, and timestamps, but not the email body or attachments.',
      },
      {
        scope: 'https://www.googleapis.com/auth/gmail.settings.basic',
        description:
          "Allows managing basic Gmail settings like signatures, vacation responders, and filters, but doesn't provide access to emails.",
      },
      {
        scope: 'https://www.googleapis.com/auth/gmail.settings.sharing',
        description:
          "Allows managing email delegation settings but doesn't provide access to email content.",
      },
    ],
  },
} satisfies JsonConnectorDef
