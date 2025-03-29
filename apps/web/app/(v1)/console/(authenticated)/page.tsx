import {Suspense} from 'react'
import type {Viewer} from '@openint/cdk'
import type {PageProps} from '@/lib-common/next-utils'
import {currentViewer} from '@/lib-server/auth.server'
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

/**
 * Wraps a promise with a random delay of up to 2 seconds
 * @param promise The promise to delay
 * @returns A new promise that resolves with the original promise's value after a delay
 */
async function withRandomDelay<T>(promise: Promise<T>): Promise<T> {
  const delay = Math.random() * 4000 // Random delay between 0-2 seconds
  await new Promise((resolve) => setTimeout(resolve, delay))
  return promise
}

function Fallback() {
  return <div>Loading...</div>
}

export default async function Page(props: PageProps) {
  const {viewer, token = ''} = await currentViewer(props)

  const api = createAPICaller(viewer)

  return (
    <div>
      <pre>
        <code>{JSON.stringify(viewer, null, 2)}</code>
      </pre>

      <h1>AddConnection</h1>
      <Suspense fallback={<Fallback />}>
        <AddConnection
          initialData={withRandomDelay(api.listConnectorConfigs())}
        />
      </Suspense>

      <h1>ConnectionList</h1>

      <Suspense fallback={<Fallback />}>
        <ConnectionList initialData={withRandomDelay(api.listConnections())} />
      </Suspense>

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
