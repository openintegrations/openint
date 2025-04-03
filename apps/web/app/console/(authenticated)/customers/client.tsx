'use client'

import {type Customer} from '@openint/api-v1/models'
import {CustomersTable} from '@openint/ui-v1/domain-components/CustomersTable'
import {useSuspenseQuery} from '@openint/ui-v1/trpc'
import {useTRPC} from '../client'

export function CustomerList(props: {
  initialData?: {
    items: Customer[]
    total: number
    limit: number
    offset: number
  }
}) {
  const {initialData} = props
  const trpc = useTRPC()
  const customerData = useSuspenseQuery(
    trpc.listCustomers.queryOptions(
      {},
      initialData ? {initialData} : undefined,
    ),
  )

  return <CustomersTable data={customerData.data.items} />
}
