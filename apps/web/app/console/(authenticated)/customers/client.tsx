'use client'

import React from 'react'
import type {AppRouterOutput} from '@openint/api-v1'
import {CustomersTable} from '@openint/ui-v1/domain-components'
import {useSuspenseQuery} from '@openint/ui-v1/trpc'
import {useTRPC} from '../client'

export function CustomerList(props: {
  initialData?: Promise<AppRouterOutput['listCustomers']>
}) {
  const initialData = React.use(props.initialData ?? Promise.resolve(undefined))
  const trpc = useTRPC()
  const customerData = useSuspenseQuery(
    trpc.listCustomers.queryOptions(
      {},
      initialData ? {initialData} : undefined,
    ),
  )

  return <CustomersTable data={customerData.data.items} />
}
