import {Suspense} from 'react'
import type {Viewer} from '@openint/cdk'
import {extractId} from '@openint/cdk'
import {TabsContent, TabsList, TabsTrigger} from '@openint/shadcn/ui/tabs'
import type {PageProps} from '@/lib-common/next-utils'
import {currentViewer} from '@/lib-server/auth.server'
import {createAPICaller} from '@/lib-server/globals'
import {ClientApp} from '../console/(authenticated)/client'
import {AddConnectionInner, MyConnectionsClient} from './client'
import {TabsClient} from './Tabs.client'

function Fallback() {
  return <div>Loading...</div>
}

export default async function Page(props: PageProps<never, {tab?: string}>) {
  const {viewer, token} = await currentViewer(props)
  const api = createAPICaller(viewer)
  return (
    <div>
      <pre className="bg-pink-400">
        <code>{JSON.stringify(viewer, null, 2)}</code>
      </pre>
      <ClientApp token={token!}>
        {/* <TabsClient defaultValue={(await props.searchParams).tab ?? 'my-connections'}> */}
        <TabsClient defaultValue="my-connections" paramKey="tab">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="my-connections">My connections</TabsTrigger>
            <TabsTrigger value="add-connection">Add connection</TabsTrigger>
          </TabsList>
          <TabsContent value="my-connections" className="p-4">
            <Suspense fallback={<Fallback />}>
              <MyConnectionsClient initialData={api.listConnections()} />
            </Suspense>
          </TabsContent>
          {/* <TabsContent value="add-connection" className="p-4">
            <Suspense fallback={<Fallback />}>
              <AddConnections viewer={viewer} />
            </Suspense>
          </TabsContent> */}
        </TabsClient>
      </ClientApp>
    </div>
  )
}

/** This needs to happen server side for preConnect to work */
async function AddConnections({viewer}: {viewer: Viewer}) {
  const api = createAPICaller(viewer)

  const res = await api.listConnectorConfigs()

  return (
    <>
      {res.items.map((ccfg) => (
        <Suspense key={ccfg.id} fallback={<Fallback />}>
          <div key={ccfg.id} className="p-4">
            <h1 className="text-3xl">Add {ccfg.id} connection</h1>
            <AddConnectionServer connectorConfigId={ccfg.id} viewer={viewer} />
          </div>
        </Suspense>
      ))}
    </>
  )
}

function AddConnectionServer({
  viewer,
  connectorConfigId,
}: {
  viewer: Viewer
  connectorConfigId: string
}) {
  const api = createAPICaller(viewer)
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
