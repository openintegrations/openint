import type {JsonConnectorDef} from '../schema'

export default {
  audience: ['business'],
  verticals: ['other'],
  display_name: 'DocuSign',
  stage: 'alpha',
  version: 1,
  auth: {
    type: 'OAUTH2',
    authorization_request_url: 'https://account.docusign.com/oauth/auth',
    token_request_url: 'https://account.docusign.com/oauth/token',
    scope_separator: ' ',
    params_config: {
      authorize: {response_type: 'code'},
      token: {grant_type: 'authorization_code'},
    },
    openint_default_scopes: ['signature', 'impersonation'],
    openint_allowed_scopes: ['signature', 'impersonation', 'organization_read'],
    scopes: [
      {
        scope: 'signature',
        description:
          'Allows the app to send envelopes and obtain signatures on behalf of the user. This is the most basic scope for eSignature functionality.',
      },
      {
        scope: 'impersonation',
        description:
          'Required for JWT (JSON Web Token) grant flow. Allows the app to act on behalf of users without their direct interaction (admin consent required).',
      },
      {
        scope: 'extended',
        description:
          "Extends the 'signature' scope to include additional operations like managing templates, custom fields, and more.",
      },
      {
        scope: 'organization_read',
        description:
          'Read-only access to organization-level data (e.g., users, groups, permissions). No write access.',
      },
      {
        scope: 'click.manage',
        description:
          'Allows managing Clickwraps (terms-of-use agreements) for the account.',
      },
      {
        scope: 'dtr.rooms.read',
        description:
          'Read-only access to DocuSign Rooms (real estate transaction management).',
      },
      {
        scope: 'dtr.rooms.write',
        description:
          'Read and write access to DocuSign Rooms (create/update rooms, documents, etc.).',
      },
      {
        scope: 'room_forms',
        description: 'Access to forms and form groups in DocuSign Rooms.',
      },
    ],
  },
} satisfies JsonConnectorDef
