import type {PageProps} from '@/lib-common/next-utils'

import {dehydrate, HydrationBoundary} from '@tanstack/react-query'
import {getServerComponentContext} from '@/lib-server/trpc.server'
import {ConnectorConfigList} from './page.client'

export default async function ConnectorConfigPage(props: PageProps) {
  const {queryClient, trpc} = await getServerComponentContext(props)

  await queryClient.prefetchQuery(
    trpc.listConnectorConfigs.queryOptions({
      expand: ['connection_count', 'connector.schemas'],
    }),
  )
  await queryClient.prefetchQuery(
    trpc.listConnectors.queryOptions({
      expand: ['schemas'],
    }),
  )

  return (
    <div className="p-6">
      <HydrationBoundary state={dehydrate(queryClient)}>
        <ConnectorConfigList />
      </HydrationBoundary>
    </div>
  )
}

// TODO:Try out the automatic prefetching on server without even needing an explicit prefetch AT ALL
