import type {JsonConnectorDef} from '../schema'

export default {
  audience: ['business'],
  verticals: ['developer-tools', 'ticketing'],
  display_name: 'GitHub',
  stage: 'ga',
  version: 1,
  auth: {
    type: 'OAUTH2',
    authorization_request_url: 'https://github.com/login/oauth/authorize',
    token_request_url: 'https://github.com/login/oauth/access_token',
    scope_separator: ' ',
    params_config: {},
    required_scopes: ['read:user', 'user:email', 'repo'],
    openint_default_scopes: [
      'read:user',
      'read:org',
      'read:project',
      'user:email',
      'repo',
    ],
    openint_allowed_scopes: [
      'user',
      'read:user',
      'read:org',
      'read:project',
      'user:email',
    ],
    /**
     * We can review the available scopes here:
     * https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/scopes-for-oauth-apps#available-scopes
     */
    scopes: [
      {
        scope: 'repo',
        description:
          'Grants full access to public and private repositories including read and write access to code, commit statuses, repository invitations, collaborators, deployment statuses, and repository webhooks. Also grants access to manage organization-owned resources including projects, invitations, team memberships and webhooks.',
      },
      {
        scope: 'repo:status',
        description:
          'Grants read/write access to commit statuses in public and private repositories. This scope is only necessary to grant other users or services access to private repository commit statuses without granting access to the code.',
      },
      {
        scope: 'repo_deployment',
        description:
          'Grants access to deployment statuses for public and private repositories. This scope is only necessary to grant other users or services access to deployment statuses, without granting access to the code.',
      },
      {
        scope: 'public_repo',
        description:
          'Limits access to public repositories. That includes read/write access to code, commit statuses, repository projects, collaborators, and deployment statuses for public repositories and organizations. Also required for starring public repositories.',
      },
      {
        scope: 'repo:invite',
        description:
          'Grants accept/decline abilities for invitations to collaborate on a repository. This scope is only necessary to grant other users or services access to invites without granting access to the code.',
      },
      {
        scope: 'security_events',
        description:
          'Grants read and write access to security events in the code scanning API. This scope is only necessary to grant other users or services access to security events without granting access to the code.',
      },
      {
        scope: 'admin:repo_hook',
        description:
          'Grants read, write, ping, and delete access to repository hooks in public or private repositories. The repo and public_repo scopes grant full access to repositories, including repository hooks. Use the admin:repo_hook scope to limit access to only repository hooks.',
      },
      {
        scope: 'write:repo_hook',
        description:
          'Grants read, write, and ping access to hooks in public or private repositories.',
      },
      {
        scope: 'read:repo_hook',
        description:
          'Grants read and ping access to hooks in public or private repositories.',
      },
      {
        scope: 'admin:org',
        description:
          'Fully manage the organization and its teams, projects, and memberships.',
      },
      {
        scope: 'write:org',
        description:
          'Read and write access to organization membership and organization projects.',
      },
      {
        scope: 'read:org',
        description:
          'Read-only access to organization membership, organization projects, and team membership.',
      },
      {
        scope: 'admin:public_key',
        description: 'Fully manage public keys.',
      },
      {
        scope: 'write:public_key',
        description: 'Create, list, and view details for public keys.',
      },
      {
        scope: 'read:public_key',
        description: 'List and view details for public keys.',
      },
      {
        scope: 'admin:org_hook',
        description:
          'Grants read, write, ping, and delete access to organization hooks. Note: OAuth tokens will only be able to perform these actions on organization hooks which were created by the OAuth app.',
      },
      {
        scope: 'gist',
        description: 'Grants write access to gists.',
      },
      {
        scope: 'notifications',
        description:
          'Grants read access to notifications, mark as read access to threads, watch/unwatch access to repositories, and read/write/delete access to thread subscriptions.',
      },
      {
        scope: 'user',
        description:
          'Grants read/write access to profile info only. Note that this scope includes user:email and user:follow.',
      },
      {
        scope: 'read:user',
        description: "Grants access to read a user's profile data.",
      },
      {
        scope: 'user:email',
        description: "Grants read access to a user's email addresses.",
      },
      {
        scope: 'user:follow',
        description: 'Grants access to follow or unfollow other users.',
      },
      {
        scope: 'project',
        description:
          'Grants read/write access to user and organization projects.',
      },
      {
        scope: 'read:project',
        description:
          'Grants read only access to user and organization projects.',
      },
      {
        scope: 'delete_repo',
        description: 'Grants access to delete adminable repositories.',
      },
      {
        scope: 'write:packages',
        description:
          'Grants access to upload or publish a package in GitHub Packages.',
      },
      {
        scope: 'read:packages',
        description:
          'Grants access to download or install packages from GitHub Packages.',
      },
      {
        scope: 'delete:packages',
        description: 'Grants access to delete packages from GitHub Packages.',
      },
      {
        scope: 'admin:gpg_key',
        description: 'Fully manage GPG keys.',
      },
      {
        scope: 'write:gpg_key',
        description: 'Create, list, and view details for GPG keys.',
      },
      {
        scope: 'read:gpg_key',
        description: 'List and view details for GPG keys.',
      },
      {
        scope: 'codespace',
        description:
          'Grants the ability to create and manage codespaces. Codespaces can expose a GITHUB_TOKEN which may have a different set of scopes.',
      },
      {
        scope: 'workflow',
        description:
          'Grants the ability to add and update GitHub Actions workflow files. Workflow files can expose GITHUB_TOKEN which may have a different set of scopes.',
      },
      {
        scope: 'read:audit_log',
        description: 'Read audit log data.',
      },
    ],
  },
} satisfies JsonConnectorDef
