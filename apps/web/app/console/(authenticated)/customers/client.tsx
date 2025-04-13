'use client'

import type {AppRouterOutput} from '@openint/api-v1'

import {useSuspenseQuery} from '@/lib-client/trpc.client'
import {CustomersTable} from '@openint/ui-v1/domain-components'
import React from 'react'
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
