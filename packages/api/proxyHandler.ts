import type {HTTPMethod, OpenAPIClient} from '@opensdks/runtime'
import {extractId, getRemoteContext, initNangoSDK} from '@openint/cdk'
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

  const credentialsExpired = remoteContext.remote.settings.oauth?.credentials?.expires_at
    ? new Date(remoteContext.remote.settings.oauth.credentials.expires_at) <
      new Date()
    : false

  // TODO: this logic is potentially being duplicated in the getRemoteContext call
  if (credentialsExpired && remoteContext.remoteConnectionId) {
    const nango = initNangoSDK({
      headers: {authorization: `Bearer ${process.env['NANGO_SECRET_KEY']}`},
    })
    const connectionExternalId = extractId(remoteContext.remoteConnectionId)[2]

    const nangoConnection = await nango
      .GET('/connection/{connectionId}', {
        params: {
          path: {
            connectionId: connectionExternalId,
          },
          query: {
            provider_config_key: remoteContext.remote.connectorConfigId,
            force_refresh: true,
          },
        },
      })
      .then((r) => r.data)

    const {connectorConfig: int} =
      await protectedContext.asOrgIfNeeded.getConnectionExpandedOrFail(
        remoteContext.remoteConnectionId,
      )

    // TODO: extract all of this logic into an oauthLink that has an option to provide a custom refresh function that can call nango & persist it to db.
    await protectedContext.asOrgIfNeeded._syncConnectionUpdate(int, {
      settings: {
        oauth: nangoConnection,
      },
      connectionExternalId,
    })
  }

  const connectorImplementedProxy = remoteContext.remote.connector.proxy
  let response: Response | null = null

  if (connectorImplementedProxy) {
    response = await connectorImplementedProxy(
      remoteContext.remote.instance,
      req,
    )
  } else if (isOpenAPIClient(remoteContext.remote.instance)) {
    const url = new URL(req.url)
    const prefix = url.protocol + '//' + url.host + '/api/proxy'

    const newUrl = req.url.replace(prefix, '')
    response = await remoteContext.remote.instance
      .request(req.method as HTTPMethod, newUrl, {
        body: req.body,
        headers: req.headers,
      })
      .then((r) => r.response)
  }

  if (!response) {
    return new Response(
      `Proxy not supported for connection: ${remoteContext.remoteConnectionId}`,
      {
        status: 404,
      },
    )
  }

  // TODO: move to stream based response
  const resBody = await response.blob()

  const headers = new Headers(response.headers)
  headers.delete('content-encoding') // No more gzip at this point...
  headers.set('content-length', resBody.size.toString())
  return new Response(resBody, {
    status: response.status,
    headers,
  })
}
