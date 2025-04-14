import type {PageProps} from '@/lib-common/next-utils'

import {currentViewer} from '@/lib-server/auth.server'
import {createAPICaller} from '@/lib-server/globals'
import {Suspense} from 'react'
import {ConnectionsPage} from './page.client'

// TODO: @rodri77 - Move to a shared component with a correct spinner.
function Fallback() {
  return <div>Loading...</div>
}

export default async function Page(props: PageProps) {
  const {viewer} = await currentViewer(props)
  const api = createAPICaller(viewer)

  return (
    <div>
      <Suspense fallback={<Fallback />}>
        <ConnectionsPage
          initialData={api.listConnections({
            expand: ['connector'],
          })}
        />
      </Suspense>
    </div>
  )
}
