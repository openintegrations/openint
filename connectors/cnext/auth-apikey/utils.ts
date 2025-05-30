import type {ConnectContext} from '@openint/cdk'
import type {Z} from '@openint/util/zod-utils'
import type {apiKeySchemas, zApiKeyConfig} from './schemas'

import {initGreenhouseSDK} from '@opensdks/sdk-greenhouse'

export function getClient({
  connectorName,
  oauthConfigTemplate,
  connectorConfig,
  connectionSettings,
  ...connectCtx
}: {
  connectorName: string
  oauthConfigTemplate: Z.infer<typeof zApiKeyConfig>
  connectorConfig: Z.infer<typeof apiKeySchemas.connector_config>
  connectionSettings:
    | Z.infer<typeof apiKeySchemas.connection_settings>
    | undefined
} & Pick<ConnectContext<{}>, 'baseURLs' | 'fetch'>) {
  // TODO: Update since for now this only creates a greenhouse client.
  // TODO: Replace with http calls or directly use a fetch post as we do for oauth2
  // and use that in checkConnection instead.
  const client = initGreenhouseSDK({
    auth: {
      basic: {
        username: connectionSettings?.oauth.credentials?.api_key ?? '',
      },
    },
  })

  return {
    client,
    apiKeyConfig: {
      connectorConfig,
      connectionSettings: connectionSettings ?? {},
      // TODO: We might not need this at all
      baseURLs: connectCtx.baseURLs,
    },
  }
}
