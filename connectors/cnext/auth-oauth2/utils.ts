import type {ConnectContext} from '@openint/cdk'
import type {oauth2Schemas, zOAuthConfig} from './schemas'

import {getConnectorDefaultCredentials} from '@openint/env'
import {createOAuth2Client} from '@openint/oauth2/createOAuth2Client'
import {type Z} from '@openint/util/zod-utils'
import {renderTemplateObject} from '../lib/template'

export function injectCcfgDefaultCredentialsIfNeeded(
  connectorConfig: Z.infer<typeof oauth2Schemas.connector_config>,
  connectorName: string,
  oauthConfig: Z.infer<typeof zOAuthConfig>,
): Z.infer<typeof oauth2Schemas.connector_config> {
  const defaultCredentials = getConnectorDefaultCredentials(connectorName)
  if (
    !connectorConfig.oauth?.client_id ||
    !connectorConfig.oauth?.client_secret
  ) {
    const client_id = defaultCredentials?.['client_id']
    const client_secret = defaultCredentials?.['client_secret']
    if (!client_id || !client_secret) {
      throw new Error(
        `Missing default credentials for connector ${connectorName}`,
      )
    }

    const configuredScopes = connectorConfig.oauth?.scopes ?? []

    if (
      oauthConfig.openint_scopes &&
      configuredScopes.length > 0 &&
      !configuredScopes.every((scope) =>
        oauthConfig.openint_scopes?.includes(scope),
      )
    ) {
      const invalidScopes = configuredScopes.filter(
        (scope) => !oauthConfig.openint_scopes?.includes(scope),
      )
      throw new Error(
        `Invalid scopes configured: ${invalidScopes.join(', ')}. ` +
          `Valid default scopes are: ${oauthConfig.openint_scopes?.join(', ')}`,
      )
    }

    return {
      ...connectorConfig,
      oauth: {
        client_id,
        client_secret,
        scopes: configuredScopes ?? [],
      },
    }
  }
  return connectorConfig
}

export function getClient({
  connectorName,
  oauthConfigTemplate,
  connectorConfig,
  connectionSettings,
  ...connectCtx
}: {
  connectorName: string
  oauthConfigTemplate: Z.infer<typeof zOAuthConfig>
  connectorConfig: Z.infer<typeof oauth2Schemas.connector_config>
  connectionSettings:
    | Z.infer<typeof oauth2Schemas.connection_settings>
    | undefined
} & Pick<ConnectContext<{}>, 'baseURLs' | 'fetch'>) {
  const oauthConfig = renderTemplateObject(oauthConfigTemplate, {
    connectorConfig,
    connectionSettings: connectionSettings ?? {},
    baseURLs: connectCtx.baseURLs,
  })

  const ccfg = injectCcfgDefaultCredentialsIfNeeded(
    connectorConfig,
    connectorName,
    oauthConfig,
  )
  const client = createOAuth2Client(
    {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      clientId: ccfg.oauth!.client_id!,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      clientSecret: ccfg.oauth!.client_secret!,
      authorizeURL: oauthConfig.authorization_request_url,
      tokenURL: oauthConfig.token_request_url,
      revokeUrl: oauthConfig.revocation_request_url,
      scopeDelimiter: oauthConfig.scope_separator,
      paramKeyMapping: oauthConfig.params_config.param_names,
      clientAuthLocation: 'body', // Make this configurable
    },
    connectCtx.fetch,
  )
  return {client, oauthConfig}
}
