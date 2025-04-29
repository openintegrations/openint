'use client'

import type {AppRouterOutput} from '@openint/api-v1'
import type {ColumnDef} from '../../components/DataTable'

import {CopyID} from '../../components'
import {DataTable} from '../../components/DataTable'
import {Icon} from '../../components/Icon'
import {formatIsoDateString} from '../../utils'

type CustomerData = AppRouterOutput['listCustomers']['items'][number]

export function CustomersTable({
  data,
  onPageChange,
  isLoading,
  onCountClick,
}: {
  data: AppRouterOutput['listCustomers']
  onPageChange: (pageIndex: number) => void
  isLoading: boolean
  onCountClick: (customerId: string) => void
}) {
  const columns: Array<ColumnDef<CustomerData>> = [
    {
      id: 'id',
      accessorKey: 'id',
      header: 'Customer Id',
      cell: ({row}) => (
        <CopyID value={row.original.id ?? ''} size="compact" width="auto" />
      ),
    },
    {
      id: 'connections',
      accessorKey: 'connection_count',
      header: 'Connections',
      cell: ({row}) => {
        const connectionsCount = row.original.connection_count

        return (
          <button
            className="group flex items-center gap-1.5 text-gray-600 transition-colors hover:text-purple-700"
            onClick={(e) => {
              if (row.original.id) {
                onCountClick(row.original.id)
              }
              // Stop propagation to prevent row click handler from firing
              e.stopPropagation()
            }}>
            <Icon
              name="Network"
              className="text-purple-600 group-hover:text-purple-700"
              size={16}
            />
            <span className="font-medium group-hover:underline">
              {`${connectionsCount} Connection${connectionsCount === 1 ? '' : 's'}`}
            </span>
          </button>
        )
      },
    },
    {
      id: 'firstCreated',
      accessorKey: 'created_at',
      header: 'First Connected',
      cell: ({row}) => (
        <div className="text-gray-500">
          {formatIsoDateString(row.original.created_at)}
        </div>
      ),
    },
  ]

  return (
    <DataTable<CustomerData, string | number>
      data={data.items}
      columns={columns}
      enableSelect={false}
      onPageChange={onPageChange}
      isLoading={isLoading}>
      <DataTable.Header>
        <DataTable.SearchInput />
        <DataTable.ColumnVisibilityToggle />
      </DataTable.Header>
      <DataTable.Table />
      <DataTable.Footer>
        <DataTable.Pagination />
      </DataTable.Footer>
    </DataTable>
  )
}
