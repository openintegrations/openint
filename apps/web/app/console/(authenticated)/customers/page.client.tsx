'use client'

import {useRouter} from 'next/navigation'
import {useState} from 'react'
import {CustomersTable} from '@openint/ui-v1/domain-components'
import {useSuspenseQuery, useTRPC} from '@/lib-client/TRPCApp'

const DATA_PER_PAGE = 20

export function CustomerList() {
  const router = useRouter()
  const trpc = useTRPC()
  const [pageIndex, setPageIndex] = useState(0)
  const [query, setQuery] = useState<string | undefined>(undefined)
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
    router.push(`/console/connections?customerId=${customerId}`)
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
