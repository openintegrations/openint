'use client'

import {CustomersTable} from '@openint/ui-v1/domain-components'
import {useSuspenseQuery, useTRPC} from '@/lib-client/TRPCApp'

export function CustomerList() {
  const trpc = useTRPC()
  const customerData = useSuspenseQuery(trpc.listCustomers.queryOptions({}))

  return <CustomersTable data={customerData.data.items} />
}
