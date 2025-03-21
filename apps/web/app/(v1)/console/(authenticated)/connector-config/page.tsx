import {Suspense} from 'react'
import type {ConnectorConfig} from '@openint/api-v1/models'
import type {PageProps} from '@/lib-common/next-utils'
import {currentViewer} from '@/lib-server/auth.server'
import {createAPICaller} from '@/lib-server/globals'
import {ClientApp} from '../client'
import {ConnectorConfigList} from './client'

function Fallback() {
  return <div>Loading...</div>
}

export default async function Page(props: PageProps) {
  const {viewer, token = ''} = await currentViewer(props)

  const api = createAPICaller(viewer)

  return (
    <div className="p-6">
      <ClientApp token={token}>
        <Suspense fallback={<Fallback />}>
          <ConnectorConfigList
            initialData={
              api.listConnectorConfigs({
                expand: 'connector,enabled_integrations,connection_count',
              }) as Promise<{
                items: Array<
                  ConnectorConfig<
                    'connector' | 'integrations' | 'connection_count'
                  >
                >
                total: number
                limit: number
                offset: number
              }>
            }
            initialConnectorData={api.listConnectors()}
          />
        </Suspense>
      </ClientApp>
    </div>
  )
}
