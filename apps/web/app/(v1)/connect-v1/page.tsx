import {Suspense} from 'react'
import {R} from '@openint/util'
import type {PageProps} from '@/lib-common/next-utils'
import {currentViewer} from '@/lib-server/auth.server'
import {createAPICaller} from '@/lib-server/globals'
import {AddConnection, Dummy} from './client'

function Fallback() {
  return <div>Loading...</div>
}

export default async function Page(props: PageProps) {
  const {viewer} = await currentViewer(props)

  const api = createAPICaller(viewer)

  const res = api.listConnectorConfigs()

  return (
    <div>
      <pre className="bg-pink-400">
        <code>{JSON.stringify(viewer, null, 2)}</code>
      </pre>
      <Dummy />
      <Suspense fallback={<Fallback />}>
        <AddConnection
          connectorConfigIds={res.then((r) => r.items.map((ccfg) => ccfg.id))}
        />
      </Suspense>
    </div>
  )
}
