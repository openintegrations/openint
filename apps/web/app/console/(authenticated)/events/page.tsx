import type {PageProps} from '@/lib-common/next-utils'

import {dehydrate, HydrationBoundary} from '@tanstack/react-query'
import {getServerComponentContext} from '@/lib-server/trpc.server'
import {EventsList} from './page.client'

export default async function Page(props: PageProps) {
  const {queryClient, trpc} = await getServerComponentContext(props)

  void queryClient.prefetchQuery(trpc.listEvents.queryOptions({}))

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <EventsList />
    </HydrationBoundary>
  )
}
