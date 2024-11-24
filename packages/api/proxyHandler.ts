import {extractId, getRemoteContext, initNangoSDK} from '@openint/cdk'
import {getProtectedContext} from '@openint/trpc'
import {contextFromRequest} from './createRouterHandler'

export const proxyHandler = async (req: Request) => {
  console.log('Proxy request', {req})
  const ctx = await contextFromRequest({req})
  console.log('Context', {ctx})
  const protectedContext = getProtectedContext(ctx)
  console.log('Protected context', {protectedContext})
  const remoteContext = await getRemoteContext(protectedContext)

  console.log('Proxy request', {ctx, remoteContext, protectedContext})
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

  const connectorImplementedProxy = await remoteContext.remote.connector.proxy
  let res: Response | null = null
  if (connectorImplementedProxy) {
    res = await connectorImplementedProxy(remoteContext.remote.instance, req)
  } else {
    const url = new URL(req.url)
    const prefix = url.protocol + '//' + url.host + '/api/proxy'
    // @ts-expect-error
    res = await remoteContext.remote.instance
      .request(req.method as 'GET', req.url.replace(prefix, ''), req)
      .then((r: any) => r.response)
  }

  if (!res) {
    return new Response(
      `Proxy not supported for resource: ${remoteContext.remoteResourceId}`,
      {
        status: 404,
      },
    )
  }

  const headers = new Headers(res.headers)
  headers.delete('content-encoding') // No more gzip at this point...
  return new Response(res.body, {
    status: res.status,
    headers,
  })
}
