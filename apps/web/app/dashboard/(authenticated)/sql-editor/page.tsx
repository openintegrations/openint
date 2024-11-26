import {NextResponse} from 'next/server'
import {_trpcReact} from '@openint/engine-frontend'
import {contextFactory} from '@/../app-config/backendConfig'
import {getOrCreateApikey} from '@/lib-server/procedures'
import {serverComponentGetViewer} from '@/lib-server/server-component-helpers'
import {SqlPage} from './SqlPage'

export default async function SqlEditorPageServer() {
  const viewer = await serverComponentGetViewer()
  const apikey = await getOrCreateApikey(viewer)
  const ctx = contextFactory.fromViewer(viewer)

  const {services} = ctx
  const connectorConfig = await services.listConnectorConfigs()

  const ccfg = connectorConfig.find((ccfg) => ccfg.connectorName === 'postgres')

  if (!ccfg) {
    return new NextResponse('Must have postgres connector config', {
      status: 400,
    })
  }

  const resources = await services.metaService.tables.resource.list({
    connectorConfigId: ccfg?.id,
  })

  const pgConnection = resources.find((r) => r.id.includes('postgres_default'))

  if (!pgConnection) {
    return new NextResponse('Must have postgres resource', {status: 400})
  }

  return <SqlPage apikey={apikey} resourceId={pgConnection.id} />
}
