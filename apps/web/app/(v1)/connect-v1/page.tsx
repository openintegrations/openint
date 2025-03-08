import {Suspense} from 'react'
import {R} from '@openint/util'
import type {PageProps} from '@/lib-common/next-utils'
import {currentViewer} from '@/lib-server/auth.server'
import {createAPICaller} from '@/lib-server/globals'
import {AddConnection} from './client'

function Fallback() {
  return <div>Loading...</div>
}

export default async function Page(props: PageProps) {
  const {viewer} = await currentViewer(props)

  const api = createAPICaller(viewer)

  const res = api.listConnectorConfigs()

  return (
    <div>
      <pre>
        <code>{JSON.stringify(viewer, null, 2)}</code>
      </pre>
      <Suspense fallback={<Fallback />}>
        <AddConnection
          connector_names={res.then((r) =>
            R.uniq(r.items.map((r) => r.connector_name)),
          )}
        />
      </Suspense>
    </div>
  )
}
