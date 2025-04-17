'use client'

import {useState} from 'react'
import {CustomersTable} from '@openint/ui-v1/domain-components'
import {useSuspenseQuery, useTRPC} from '@/lib-client/TRPCApp'

export function CustomerList() {
  const trpc = useTRPC()
  const [pageIndex, setPageIndex] = useState(0)
  const customerData = useSuspenseQuery(
    trpc.listCustomers.queryOptions({
      limit: 10,
      offset: pageIndex * 10,
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
