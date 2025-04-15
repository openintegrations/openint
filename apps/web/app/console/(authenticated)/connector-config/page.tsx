import type {PageProps} from '@/lib-common/next-utils'

import {dehydrate, HydrationBoundary} from '@tanstack/react-query'
import {getServerComponentContext} from '@/lib-server/trpc.server'
import {ConnectorConfigList} from './page.client'

// if we comment out prefetch, then technically server still should stream / respect suspense boundary?
// or is that not how it works?
// I would expect server streaming to work with SSR but it is not working for
// whatever reason... it only works when we do explicit prefetch
// whereas I guess SSR just blocks the full page?
// That's why we have server comopnents?


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
