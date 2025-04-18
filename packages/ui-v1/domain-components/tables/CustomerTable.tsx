'use client'

import type {AppRouterOutput} from '@openint/api-v1'
import type {ColumnDef} from '../../components/DataTable'

import {MoreHorizontal} from 'lucide-react'
import {Button} from '@openint/shadcn/ui'
import {CopyID} from '../../components'
import {DataTable} from '../../components/DataTable'
import {Icon} from '../../components/Icon'
import {formatIsoDateString} from '../../utils'

const columns: Array<
  ColumnDef<AppRouterOutput['listCustomers']['items'][number]>
> = [
  {
    id: 'id',
    header: 'Customer Id',
    cell: ({row}) => (
      <CopyID value={row.original.id} size="compact" width="auto" />
    ),
  },
  {
    id: 'connections',
    header: 'Connections',
    cell: ({row}) => {
      const connectionsCount = row.original.connection_count

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
    header: 'First Connected',
    cell: ({row}) => (
      <div className="text-gray-500">
        {formatIsoDateString(row.original.created_at)}
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
}: {
  data: AppRouterOutput['listCustomers']['items']
}) {
  return (
    <DataTable data={data} columns={columns} enableSelect={false}>
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
