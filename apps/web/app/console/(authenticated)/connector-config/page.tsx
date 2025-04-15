import type {PageProps} from '@/lib-common/next-utils'

import {dehydrate, HydrationBoundary} from '@tanstack/react-query'
import {getServerComponentContext} from '@/lib-server/trpc.server'
import {ConnectorConfigList} from './page.client'

/**
 * Only purpose now is to provide explicit prefetching of data for perf. 
 * Client component will work automagically with or without this.
 */
export default async function ConnectorConfigPageExplicitPrefetch(
  props: PageProps,
) {
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

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ConnectorConfigList />
    </HydrationBoundary>
  )
}
