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

  const ccfg = connectorConfig.find((ccfg) => ccfg.connector_name === 'postgres')

  if (!ccfg) {
    return new NextResponse('Must have postgres connector config', {
      status: 400,
    })
  }

  const connections = await services.metaService.tables.connection.list({
    connector_config_id: ccfg?.id,
  })

  const pgConnection = connections.find((r) => r.id.includes('postgres_default'))

  if (!pgConnection) {
    return new NextResponse('Must have postgres connection', {status: 400})
  }

  return <SqlPage apikey={apikey} connectionId={pgConnection.id} />
}
