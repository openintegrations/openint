import {Suspense} from 'react'
import type {Viewer} from '@openint/cdk'
import {z} from '@openint/util'
import {setupFixture} from '@/__tests__/test-utils.v1'
import type {PageProps} from '@/lib-common/next-utils'
import {parsePageProps} from '@/lib-common/next-utils'
import type {APICaller} from '@/lib-server/globals'
import {createAPICaller} from '@/lib-server/globals'
import {AddConnection, ClientApp, ConnectionList} from './client'

async function AddConnectionServer({
  viewer,
}: {
  api?: APICaller
  viewer: Viewer
}) {
  const api = createAPICaller(viewer)

  // Simulate a random delay between 0-2 seconds
  await new Promise((resolve) => setTimeout(resolve, Math.random() * 2000))

  const connectorConfigs = await api.listConnectorConfigs()

  return (
    <ul>
      list...
      {connectorConfigs.items.map((ccfg) => (
        <li key={ccfg.id} className="ml-4 list-disc">
          <p>{ccfg.id}</p>
        </li>
      ))}
    </ul>
  )
}

async function ConnectionListServer({
  viewer,
}: {
  api?: APICaller
  viewer: Viewer
}) {
  const api = createAPICaller(viewer)

  // Simulate a random delay between 0-2 seconds
  await new Promise((resolve) => setTimeout(resolve, Math.random() * 2000))

  const connections = await api.listConnections()

  return (
    <ul>
      {connections.items.map((conn) => (
        <li key={conn.id} className="ml-4 list-disc">
          <p>{conn.id}</p>
        </li>
      ))}
    </ul>
  )
}
function Fallback() {
  return <div>Loading...</div>
}

export default async function Page(props: PageProps) {
  const {
    searchParams: {org_id},
  } = await parsePageProps(props, {
    searchParams: z.object({org_id: z.string().optional()}),
  })
  const {viewer, token} = await setupFixture({orgId: org_id ?? 'org_123'})

  return (
    <div>
      <ClientApp token={token}>
        <h1>AddConnection</h1>
        <Suspense fallback={<Fallback />}>
          <AddConnection initialData={{}} />
        </Suspense>

        <h1>ConnectionList</h1>

        <Suspense fallback={<Fallback />}>
          <ConnectionList initialData={{}} />
        </Suspense>
      </ClientApp>

      <hr />
      <hr />
      <hr />
      <h1>AddConnection</h1>
      <Suspense fallback={<Fallback />}>
        <AddConnectionServer viewer={viewer} />
      </Suspense>

      <h1>ConnectionList</h1>

      <Suspense fallback={<Fallback />}>
        <ConnectionListServer viewer={viewer} />
      </Suspense>
    </div>
  )
}
