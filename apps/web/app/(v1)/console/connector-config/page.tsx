import {Suspense} from 'react'
import type {PageProps} from '@/lib-common/next-utils'
import {currentViewer} from '@/lib-server/auth.server'
import {createAPICaller} from '@/lib-server/globals'
import {ClientApp} from '../client'
import {ConnectorConfigList, ConnectorConfigListHeader} from './client'

function Fallback() {
  return <div>Loading...</div>
}

export default async function Page(props: PageProps) {
  const {viewer, token = ''} = await currentViewer(props)

  const api = createAPICaller(viewer)

  return (
    <div>
      <ClientApp token={token}>
        <Suspense fallback={<Fallback />}>
          <ConnectorConfigListHeader initialData={api.listConnectors()} />
          <ConnectorConfigList
            initialData={api.listConnectorConfigs({
              expand: 'enabled_integrations,connection_count',
            })}
          />
        </Suspense>
      </ClientApp>
    </div>
  )
}
