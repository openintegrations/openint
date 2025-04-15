import type {PageProps} from '@/lib-common/next-utils'

import {getServerComponentContext} from '@/lib-server/trpc.server'
import {dehydrate, HydrationBoundary} from '@tanstack/react-query'
import {CustomerList} from './page.client'

export default async function Page(props: PageProps) {
  const {queryClient, trpc} = await getServerComponentContext(props)

  void queryClient.prefetchQuery(trpc.listCustomers.queryOptions({}))

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <CustomerList />
    </HydrationBoundary>
  )
}
