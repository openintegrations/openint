import type {ConnectorConfig} from '@openint/api-v1/models'
import type {PageProps} from '@/lib-common/next-utils'

import {Suspense} from 'react'
import {currentViewer} from '@/lib-server/auth.server'
import {createAPICaller} from '@/lib-server/globals'
import {ConnectorConfigList} from './page.client'

function Fallback() {
  return <div>Loading...</div>
}

export default async function Page(props: PageProps) {
  const {viewer} = await currentViewer(props)

  const api = createAPICaller(viewer)

  return (
    <div className="p-6">
      <Suspense fallback={<Fallback />}>
        <ConnectorConfigList
          initialData={
            (await api.listConnectorConfigs({
              expand: ['connection_count', 'connector.schemas'],
            })) as {
              items: Array<
                ConnectorConfig<
                  'connector' | 'integrations' | 'connection_count'
                >
              >
              total: number
              limit: number
              offset: number
            }
          }
          initialConnectorData={await api.listConnectors({
            expand: ['schemas'],
          })}
        />
      </Suspense>
    </div>
  )
}
