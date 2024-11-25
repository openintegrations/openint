import type {HTTPMethod, OpenAPIClient} from '@opensdks/runtime'
import {extractId, getRemoteContext, initNangoSDK, Link} from '@openint/cdk'
import {getProtectedContext} from '@openint/trpc'
import {contextFromRequest} from './createRouterHandler'

function isOpenAPIClient(instance: any): instance is OpenAPIClient<any> {
  const hasRequest = typeof instance?.request === 'function'
  const hasLinksArray = Array.isArray(instance?.links)
  return hasRequest && hasLinksArray
}

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

    console.log('Syncing resource update...')
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
  } else if (isOpenAPIClient(remoteContext.remote.instance)) {
    const url = new URL(req.url)
    const prefix = url.protocol + '//' + url.host + '/api/proxy'

    const newUrl = req.url.replace(prefix, '')
    res = await remoteContext.remote.instance
      .request(req.method as HTTPMethod, newUrl, {
        body: req.body,
        headers: req.headers,
      })
      .then((r) => r.response)
  }

  if (!res) {
    return new Response(
      `Proxy not supported for resource: ${remoteContext.remoteResourceId}`,
      {
        status: 404,
      },
    )
  }

  const resBody = await res.blob()

  const headers = new Headers(res.headers)
  headers.delete('content-encoding') // No more gzip at this point...
  headers.delete('content-length') // We don't want to send the content length header in case it is wrong due to compression
  return new Response(resBody, {
    status: res.status,
    headers,
  })
}
