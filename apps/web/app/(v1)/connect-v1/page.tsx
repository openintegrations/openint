import {Suspense} from 'react'
import {extractId} from '@openint/cdk'
import type {PageProps} from '@/lib-common/next-utils'
import {currentViewer} from '@/lib-server/auth.server'
import type {APICaller} from '@/lib-server/globals'
import {createAPICaller} from '@/lib-server/globals'
import {ClientApp} from '../console/(authenticated)/client'
import {AddConnectionInner, MyConnectionsClient} from './client'

function Fallback() {
  return <div>Loading...</div>
}

export default async function Page(props: PageProps) {
  const {viewer, token} = await currentViewer(props)
  const api = createAPICaller(viewer)
  return (
    <div>
      <pre className="bg-pink-400">
        <code>{JSON.stringify(viewer, null, 2)}</code>
      </pre>
      <ClientApp token={token!}>
        <Suspense fallback={<Fallback />}>
          <MyConnectionsClient initialData={api.listConnections()} />
        </Suspense>
        <Suspense fallback={<Fallback />}>
          <AddConnections api={api} />
        </Suspense>
      </ClientApp>
    </div>
  )
}

/** This needs to happen server side for preConnect to work */
async function AddConnections({api}: {api: APICaller}) {
  const res = await api.listConnectorConfigs()

  return (
    <>
      {res.items.map((ccfg) => (
        <Suspense key={ccfg.id} fallback={<Fallback />}>
          <div key={ccfg.id} className="p-4">
            <h1 className="text-3xl">Add {ccfg.id} connection</h1>
            <AddConnectionServer connectorConfigId={ccfg.id} api={api} />
          </div>
        </Suspense>
      ))}
    </>
  )
}

function AddConnectionServer({
  api,
  connectorConfigId,
}: {
  api: APICaller
  connectorConfigId: string
}) {
  const name = extractId(connectorConfigId as `ccfg_${string}`)[1]
  const res = api.preConnect({
    id: connectorConfigId,
    data: {connector_name: name, input: {}},
    options: {},
  })

  return (
    <AddConnectionInner
      connectorConfigId={connectorConfigId}
      initialData={res}
    />
  )
}
