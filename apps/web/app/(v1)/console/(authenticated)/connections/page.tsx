import {Suspense} from 'react'
import type {PageProps} from '@/lib-common/next-utils'
import {currentViewer} from '@/lib-server/auth.server'
import {createAPICaller} from '@/lib-server/globals'
import {ClientApp} from '../client'
import {ConnectionList} from './client'

// TODO: @rodri77 - Move to a shared component with a correct spinner.
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
          <ConnectionList initialData={api.listConnections()} />
        </Suspense>
      </ClientApp>
    </div>
  )
}
