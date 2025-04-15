import type {PageProps} from '@/lib-common/next-utils'

import {dehydrate, HydrationBoundary} from '@tanstack/react-query'
import {getServerComponentContext} from '@/lib-server/trpc.server'
import {ConnectorConfigList} from './page.client'

export async function ConnectorConfigPageExplicitPrefetch(props: PageProps) {
  const {queryClient, trpc} = await getServerComponentContext(props)

  void queryClient.prefetchQuery(
    trpc.listConnectorConfigs.queryOptions({
      expand: ['connection_count', 'connector.schemas'],
    }),
  )
  void queryClient.prefetchQuery(
    trpc.listConnectors.queryOptions({
      expand: ['schemas'],
    }),
  )
  const state = dehydrate(queryClient)
  // console.log(JSON.stringify(state, null, 2))

  return (
    <div className="p-6">
      <HydrationBoundary state={state}>
        <ConnectorConfigList />
      </HydrationBoundary>
    </div>
  )
}

// TODO:Try out the automatic prefetching on server without even needing an explicit prefetch AT ALL

export default function ConnectorConfigPage(props: PageProps) {
  return (
    <div className="p-6">
      <ConnectorConfigList />
    </div>
  )
}
