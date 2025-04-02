'use client'

import {MoreHorizontal} from 'lucide-react'
import {Button} from '@openint/shadcn/ui'
import {CustomerTableCell} from '../components/CustomerTableCell'
import type {ColumnDef} from '../components/DataTable'
import {DataTable} from '../components/DataTable'
import {Icon} from '../components/Icon'
import {formatIsoDateString} from '../utils'

// Define the Customer data structure based on the image
export interface Customer {
  id: string
  connectionsCount: number
  firstCreated: string
}

// Define the columns for the customers table
export const columns: Array<ColumnDef<Customer>> = [
  {
    id: 'customer',
    header: 'Customer',
    cell: ({row}) => (
      <CustomerTableCell
        customer={{
          id: row.original.id,
          created_at: row.original.firstCreated,
          updated_at: row.original.firstCreated,
          connection_count: row.original.connectionsCount,
        }}
        compact={true}
        useIcon={true}
      />
    ),
  },
  {
    id: 'connections',
    header: 'Connections',
    cell: ({row}) => {
      const connectionsCount = row.original.connectionsCount

      return (
        <button
          className="group flex items-center gap-1.5 text-gray-600 transition-colors hover:text-purple-700"
          onClick={(e) => {
            // Stop propagation to prevent row click handler from firing
            e.stopPropagation()
            console.log(
              `View ${connectionsCount} connections for ${row.original.id}`,
            )
          }}>
          <Icon
            name="Network"
            className="text-purple-600 group-hover:text-purple-700"
            size={16}
          />
          <span className="font-medium group-hover:underline">
            {connectionsCount}
          </span>
        </button>
      )
    },
  },
  {
    id: 'firstCreated',
    header: 'First Created',
    accessorKey: 'firstCreated',
    cell: ({row}) => (
      <div className="text-gray-500">
        {formatIsoDateString(row.original.firstCreated)}
      </div>
    ),
  },
  {
    id: 'action',
    header: '',
    cell: () => (
      <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
        <MoreHorizontal className="h-4 w-4" />
      </Button>
    ),
  },
]

export function CustomersTable({
  data,
  enableSelect,
  onRowClick,
}: {
  data: Customer[]
  enableSelect?: boolean
  onRowClick?: (customer: Customer) => void
}) {
  return (
    <DataTable
      data={data}
      columns={columns}
      enableSelect={enableSelect}
      onRowClick={
        onRowClick
          ? (row) => {
              onRowClick(row)
            }
          : undefined
      }>
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
