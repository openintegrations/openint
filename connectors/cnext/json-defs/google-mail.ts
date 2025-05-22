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
    openint_default_scopes: ['https://www.googleapis.com/auth/gmail.metadata'],
    openint_allowed_scopes: ['https://www.googleapis.com/auth/gmail.metadata'],
    /**
     * We can review the available scopes here:
     * https://developers.google.com/identity/protocols/oauth2/scopes#gmail
     */
    scopes: [
      {
        scope: 'https://mail.google.com/',
        description:
          'Read, compose, send, and permanently delete all your email from Gmail',
      },
      {
        scope:
          'https://www.googleapis.com/auth/gmail.addons.current.action.compose',
        description:
          'Manage drafts and send emails when you interact with the add-on',
      },
      {
        scope:
          'https://www.googleapis.com/auth/gmail.addons.current.message.action',
        description:
          'View your email messages when you interact with the add-on',
      },
      {
        scope:
          'https://www.googleapis.com/auth/gmail.addons.current.message.metadata',
        description:
          'View your email message metadata when the add-on is running',
      },
      {
        scope:
          'https://www.googleapis.com/auth/gmail.addons.current.message.readonly',
        description: 'View your email messages when the add-on is running',
      },
      {
        scope: 'https://www.googleapis.com/auth/gmail.compose',
        description: 'Manage drafts and send emails',
      },
      {
        scope: 'https://www.googleapis.com/auth/gmail.insert',
        description: 'Add emails into your Gmail mailbox',
      },
      {
        scope: 'https://www.googleapis.com/auth/gmail.labels',
        description: 'See and edit your email labels',
      },
      {
        scope: 'https://www.googleapis.com/auth/gmail.metadata',
        description:
          'View your email message metadata such as labels and headers, but not the email body',
      },
      {
        scope: 'https://www.googleapis.com/auth/gmail.modify',
        description: 'Read, compose, and send emails from your Gmail account',
      },
      {
        scope: 'https://www.googleapis.com/auth/gmail.readonly',
        description: 'View your email messages and settings',
      },
      {
        scope: 'https://www.googleapis.com/auth/gmail.send',
        description: 'Send email on your behalf',
      },
      {
        scope: 'https://www.googleapis.com/auth/gmail.settings.basic',
        description:
          'See, edit, create, or change your email settings and filters in Gmail',
      },
      {
        scope: 'https://www.googleapis.com/auth/gmail.settings.sharing',
        description: 'Manage Gmail sharing settings',
      },
    ],
  },
} satisfies JsonConnectorDef
