'use client'

import {useRouter} from 'next/navigation'
import React from 'react'
import {CustomersTable} from '@openint/ui-v1/domain-components'
import {useStateFromSearchParams} from '@openint/ui-v1/hooks/useStateFromSearchParam'
import {useSuspenseQuery, useTRPC} from '@/lib-client/TRPCApp'
import {resolveLinkPath} from '@/lib-common/Link'

const DATA_PER_PAGE = 20

export function CustomerList() {
  const router = useRouter()
  const trpc = useTRPC()
  const [pageIndex, setPageIndex] = React.useState(0)
  const [query, setQuery] = useStateFromSearchParams('q', {
    shallow: true,
    defaultValue: '' as string,
  })

  React.useEffect(() => {
    // Reset page index when search params query changes
    setPageIndex(0)
  }, [query])

  const customerData = useSuspenseQuery(
    trpc.listCustomers.queryOptions({
      limit: DATA_PER_PAGE,
      offset: pageIndex * DATA_PER_PAGE,
      search_query: query,
    }),
  )

  const handlePageChange = (newPageIndex: number) => {
    setPageIndex(newPageIndex)
  }

  const handleCountClick = (customerId: string) => {
    router.push(resolveLinkPath('/console/connections') + `?q=${customerId}`)
  }

  return (
    <CustomersTable
      data={customerData.data}
      onPageChange={handlePageChange}
      isLoading={customerData.isFetching || customerData.isLoading}
      onCountClick={handleCountClick}
      query={query}
      onQueryChange={setQuery}
    />
  )
}
