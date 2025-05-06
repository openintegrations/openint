import type {PageProps} from '@/lib-common/next-utils'

import {dehydrate, HydrationBoundary} from '@tanstack/react-query'
import {Suspense} from 'react'
import {LoadingSpinner} from '@openint/ui-v1/components'
import {getServerComponentContext} from '@/lib-server/trpc.server'
import {ConnectionsPage} from './page.client'

export default async function Page(props: PageProps) {
  const {queryClient, trpc} = await getServerComponentContext(props)

  void queryClient.prefetchQuery(
    trpc.listConnections.queryOptions({
      expand: ['connector'],
    }),
  )

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<LoadingSpinner />}>
        <ConnectionsPage />
      </Suspense>
    </HydrationBoundary>
  )
}
