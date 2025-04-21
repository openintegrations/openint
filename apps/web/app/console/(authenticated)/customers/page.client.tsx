'use client'

import {useState} from 'react'
import {CustomersTable} from '@openint/ui-v1/domain-components'
import {useSuspenseQuery, useTRPC} from '@/lib-client/TRPCApp'

const DATA_PER_PAGE = 20

export function CustomerList() {
  const trpc = useTRPC()
  const [pageIndex, setPageIndex] = useState(0)
  const customerData = useSuspenseQuery(
    trpc.listCustomers.queryOptions({
      limit: DATA_PER_PAGE,
      offset: pageIndex * DATA_PER_PAGE,
    }),
  )

  const handlePageChange = (newPageIndex: number) => {
    setPageIndex(newPageIndex)
  }

  return (
    <CustomersTable
      data={customerData.data}
      onPageChange={handlePageChange}
      isLoading={customerData.isFetching || customerData.isLoading}
    />
  )
}
