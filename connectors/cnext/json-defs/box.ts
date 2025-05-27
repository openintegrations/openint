import type {JsonConnectorDef} from '../schema'

export default {
  audience: ['business'],
  verticals: ['wiki', 'file-storage'],
  display_name: 'Box',
  stage: 'alpha',
  version: 1,
  auth: {
    type: 'OAUTH2',
    authorization_request_url: 'https://account.box.com/api/oauth2/authorize',
    token_request_url: 'https://api.box.com/oauth2/token',
    scope_separator: ' ',
    params_config: {},
    openint_default_scopes: ['openid', 'root_readonly'],
    openint_allowed_scopes: ['openid', 'root_readonly', 'read'],
    scopes: [
      {
        scope: 'openid',
        description:
          'Allows the application to authenticate the user and receive basic profile information (like user ID) using OpenID Connect. This is often required for authorization flows.',
      },
      {
        scope: 'root_readonly',
        description:
          "Provides read-only access to the user's root folder (i.e., the top-level directory in their Box account). This is the smallest surface area scope as it only allows listing and viewing files/folders at the root level.",
      },
      {
        scope: 'read',
        description:
          'Provides read access to all files and folders the user has permissions to view in their Box account (broader than root_readonly).',
      },
      {
        scope: 'write',
        description:
          'Provides read and write access to all files and folders the user can access, including uploading, editing, and deleting content.',
      },
      {
        scope: 'manage_enterprise_properties',
        description:
          'Allows managing metadata and properties for enterprise-wide content (admin-level scope).',
      },
      {
        scope: 'manage_enterprise_users',
        description:
          'Allows creating, updating, and deleting enterprise users (admin-level scope).',
      },
    ],
  },
} satisfies JsonConnectorDef
