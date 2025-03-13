import {Suspense} from 'react'
import type {PageProps} from '@/lib-common/next-utils'
import {currentViewer} from '@/lib-server/auth.server'
import {createAPICaller} from '@/lib-server/globals'
import {ClientApp} from '../client'

function Fallback() {
  return <div>Loading...</div>
}

export default async function Page(props: PageProps) {
  const {viewer, token = ''} = await currentViewer(props)

  const api = createAPICaller(viewer)
  const connectorConfigs = await api.listConnectorConfigs({
    expand: 'enabled_integrations',
  })

  return (
    <div>
      <ClientApp token={token}>
        <h1>Connector Configs</h1>
        <Suspense fallback={<Fallback />}>
          <pre>{JSON.stringify(connectorConfigs.items, null, 2)}</pre>
        </Suspense>
      </ClientApp>
    </div>
  )
}
