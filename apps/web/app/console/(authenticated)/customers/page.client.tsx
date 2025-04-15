'use client'

import type {AppRouterOutput} from '@openint/api-v1'

import React from 'react'
import {CustomersTable} from '@openint/ui-v1/domain-components'
import {useSuspenseQuery, useTRPC} from '@/lib-client/TRPCApp'

export function CustomerList() {
  const trpc = useTRPC()
  const customerData = useSuspenseQuery(trpc.listCustomers.queryOptions({}))

  return <CustomersTable data={customerData.data.items} />
}
