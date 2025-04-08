import type {JsonConnectorDef} from '../schema'

export const jsonDef = {
  audience: ['business'],
  verticals: ['social-media'],
  display_name: 'Reddit',
  stage: 'ga',
  version: 1,
  auth: {
    type: 'OAUTH2',
    authorization_request_url: 'https://www.reddit.com/api/v1/authorize',
    token_request_url: 'https://www.reddit.com/api/v1/access_token',
    scope_separator: ' ',
    params_config: {authorize: {duration: 'permanent'}},
    openint_scopes: ['wikiread'],
    scopes: [
      {
        scope: 'identity',
        description:
          'Access your Reddit username and signup date, karma, trophies, and other public info shown on your profile',
      },
      {
        scope: 'edit',
        description: 'Edit and delete your comments and submissions',
      },
      {
        scope: 'flair',
        description: 'Select and edit your user flair in subreddits',
      },
      {
        scope: 'history',
        description:
          "Access your voting history and comments/submissions you've hidden/saved",
      },
      {
        scope: 'modconfig',
        description:
          'Manage moderator configuration for subreddits you moderate (flair, settings, etc.)',
      },
      {
        scope: 'modflair',
        description: 'Manage user flair in subreddits you moderate',
      },
      {
        scope: 'modlog',
        description: 'Access moderation logs for subreddits you moderate',
      },
      {
        scope: 'modposts',
        description:
          'Approve, remove, mark NSFW, and distinguish content in subreddits you moderate',
      },
      {
        scope: 'modwiki',
        description: 'Modify wiki pages in subreddits you moderate',
      },
      {
        scope: 'mysubreddits',
        description:
          'Access the list of subreddits you moderate, contribute to, and subscribe to',
      },
      {scope: 'privatemessages', description: 'Read and send private messages'},
      {
        scope: 'read',
        description:
          'Access posts and comments through your account (required for most read operations)',
      },
      {scope: 'report', description: 'Report content for rules violations'},
      {scope: 'save', description: 'Save and unsave comments and submissions'},
      {
        scope: 'submit',
        description: 'Submit links and comments from your account',
      },
      {scope: 'subscribe', description: 'Manage your subreddit subscriptions'},
      {
        scope: 'vote',
        description: 'Submit and change votes on comments and submissions',
      },
      {
        scope: 'wikiedit',
        description: 'Edit wiki pages in subreddits you have access to',
      },
      {scope: 'wikiread', description: 'Read wiki pages in public subreddits'},
    ],
  },
} satisfies JsonConnectorDef
