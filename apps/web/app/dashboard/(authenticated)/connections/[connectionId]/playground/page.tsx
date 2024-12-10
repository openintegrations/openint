import type {Id} from '@openint/cdk'
import {contextFactory} from '@/../app-config/backendConfig'
import {getOrCreateApikey} from '@/lib-server'
import {serverComponentGetViewer} from '@/lib-server/server-component-helpers'
import {PlaygroundPage} from './PlaygroundPage'

export default async function PlaygroundPageServer({
  params: {connectionId},
}: {
  params: {connectionId: Id['conn']}
}) {
  const viewer = await serverComponentGetViewer()
  const apikey = await getOrCreateApikey(viewer)
  const ctx = contextFactory.fromViewer(viewer)

  const connection =
    await ctx.services.getConnectionExpandedOrFail(connectionId)

  const oas =
    connection.connectorConfig.connector.metadata?.openapiSpec?.proxied

  if (!oas) {
    return (
      <div className="p-6">
        {connection.connectorName} does not have OpenAPI spec
      </div>
    )
  }

  return (
    <PlaygroundPage apikey={apikey} connectionId={connectionId} oas={oas} />
  )
}
