import type {JsonConnectorDef} from '../schema'

export default {
  audience: ['business'],
  verticals: ['file-storage', 'communication'],
  display_name: 'SharePoint',
  stage: 'ga',
  version: 1,
  auth: {
    type: 'OAUTH2',
    authorization_request_url:
      'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
    token_request_url:
      'https://login.microsoftonline.com/common/oauth2/v2.0/token',
    scope_separator: ' ',
    params_config: {
      authorize: {
        response_type: 'code',
        response_mode: 'query',
        prompt: 'consent',
      },
      token: {grant_type: 'authorization_code'},
    },
    openint_default_scopes: [
      'offline_access',
      'openid',
      'MyFiles.Read',
      'MyFiles.Write',
    ],
    openint_allowed_scopes: [
      'offline_access',
      'openid',
      'MyFiles.Read',
      'MyFiles.Write',
      'Project.Read',
      'Project.Write',
    ],
    /**
     * Go to https://portal.azure.com/#view/Microsoft_AAD_RegisteredApps/ApplicationsListBlade
     * Click all applications and select openint
     * Click api permissions
     * Click 'Add a permission' select sharepoint and there we can see the list of scopes
     * Add as necessary
     */
    scopes: [
      {
        scope: 'offline_access',
        description:
          'Allows the application to request refresh tokens, which can be used to obtain new access tokens without user interaction. This enables the application to maintain access to resources even when the user is not actively using the application.',
      },
      {
        scope: 'openid',
        description:
          'Enables user authentication and allows the application to receive a unique identifier for the user. This scope is required for OpenID Connect authentication flows and provides basic identity information about the authenticated user.',
      },
      {
        scope: 'AllSites.Read',
        description: 'Read items in all site collections',
      },
      {
        scope: 'AllSites.Write',
        description: 'Read and write items in all site collections',
      },
      {
        scope: 'EnterpriseResource.Read',
        description: 'Read user project enterprise resources',
      },
      {
        scope: 'EnterpriseResource.Write',
        description: 'Read and write user project enterprise resources',
      },
      {
        scope: 'MyFiles.Read',
        description: 'Read user files',
      },
      {
        scope: 'MyFiles.Write',
        description: 'Read and write user files',
      },
      {
        scope: 'Project.Read',
        description: 'Read user projects',
      },
      {
        scope: 'Project.Write',
        description: 'Read and write user projects',
      },
      {
        scope: 'ProjectWebAppReporting.Read',
        description: 'Read ProjectWebApp OData reporting data',
      },
      {
        scope: 'Sites.Read.All',
        description: 'Read items in all site collections',
      },
      {
        scope: 'Sites.Selected',
        description: 'Access selected site collections',
      },
      {
        scope: 'TaskStatus.Submit',
        description: 'Submit project task status updates',
      },
    ],
  },
} satisfies JsonConnectorDef
