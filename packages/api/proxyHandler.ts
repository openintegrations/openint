import {extractId, getRemoteContext, initNangoSDK} from '@openint/cdk'
import {getProtectedContext} from '@openint/trpc'
import {contextFromRequest} from './createRouterHandler'

export const proxyHandler = async (req: Request) => {
  const ctx = await contextFromRequest({req})
  const protectedContext = getProtectedContext(ctx)
  const remoteContext = await getRemoteContext(protectedContext)

  const credentialsExpired = remoteContext.remote.settings.oauth?.credentials
    .expires_at
    ? new Date(remoteContext.remote.settings.oauth.credentials.expires_at) <
      new Date()
    : false

  if (credentialsExpired && remoteContext.remoteResourceId) {
    const nango = initNangoSDK({
      headers: {authorization: `Bearer ${process.env['NANGO_SECRET_KEY']}`},
    })
    const resourceExternalId = extractId(remoteContext.remoteResourceId)[2]
    const nangoConnection = await nango
      .GET('/connection/{connectionId}', {
        params: {
          path: {
            connectionId: resourceExternalId,
          },
          query: {
            provider_config_key: remoteContext.remote.connectorConfigId,
            force_refresh: true,
          },
        },
      })
      .then((r) => r.data)

    const {connectorConfig: int} =
      await protectedContext.asOrgIfNeeded.getResourceExpandedOrFail(
        remoteContext.remoteResourceId,
      )

    await protectedContext.asOrgIfNeeded._syncResourceUpdate(int, {
      settings: {
        oauth: nangoConnection,
      },
      resourceExternalId,
    })
  }

  const res = await remoteContext.remote.connector.proxy?.(
    remoteContext.remote.instance,
    req,
  )
  if (!res) {
    return new Response(`Not implemented: ${remoteContext.remoteResourceId}`, {
      status: 404,
    })
  }
  const headers = new Headers(res.headers)
  headers.delete('content-encoding') // No more gzip at this point...
  return new Response(res.body, {
    status: res.status,
    headers,
  })
}
