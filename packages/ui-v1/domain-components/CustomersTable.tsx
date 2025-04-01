'use client'

import {MoreHorizontal} from 'lucide-react'
import {Button} from '@openint/shadcn/ui'
import {CustomerTableCell} from '../components/CustomerTableCell'
import type {ColumnDef} from '../components/DataTable'
import {DataTable} from '../components/DataTable'
import {Icon} from '../components/Icon'

// Define the Customer data structure based on the image
export interface Customer {
  id: string
  name: string
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
        name={row.original.name}
        id={row.original.id}
        compact={true}
        useIcon={true}
        backgroundColor="#f3e8ff"
        textColor="#9333ea"
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
              `View ${connectionsCount} connections for ${row.original.name}`,
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
      <div className="text-gray-500">{row.original.firstCreated}</div>
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
