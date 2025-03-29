'use client'

import {Loader2, Trash} from 'lucide-react'
import {useMemo} from 'react'
import type {Core} from '@openint/api-v1/models'
import {Button} from '@openint/shadcn/ui'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@openint/shadcn/ui/alert-dialog'
import {CommandPopover} from '@openint/ui-v1'
import {DataTable, type ColumnDef} from '@openint/ui-v1/components/DataTable'
import {useMutation, useSuspenseQuery} from '@openint/ui-v1/trpc'
import {useCommandDefinitionMap} from '@/app/(v1)/GlobalCommandBarProvider'
import {useTRPC} from '../client'

const columns: Array<ColumnDef<Core['connection']>> = [
  {
    id: 'id',
    header: 'id',
    accessorKey: 'id',
  },
  {
    id: 'connector_name',
    header: 'Connector',
    accessorKey: 'connector_name',
  },
  {
    id: 'connector_config_id',
    header: 'Connector Config ID',
    accessorKey: 'connector_config_id',
  },
  {
    id: 'created_at',
    header: 'Created At',
    accessorKey: 'created_at',
  },
  {
    id: 'updated_at',
    header: 'Updated At',
    accessorKey: 'updated_at',
  },
]

export function ConnectionList(props: {
  initialData?: {
    items: Array<Core['connection']>
    total: number
    limit: number
    offset: number
  }
}) {
  const {initialData} = props
  const trpc = useTRPC()
  const connectionData = useSuspenseQuery(
    trpc.listConnections.queryOptions(
      {},
      initialData ? {initialData} : undefined,
    ),
  )

  const deleteConn = useMutation(
    trpc.deleteConnection.mutationOptions({
      onSuccess: async () => {
        await connectionData.refetch()
      },
      onError: (error) => {
        // TODO: @rodri77 - Add a toast to the UI.
        console.error(error)
      },
    }),
  )
  const definitions = useCommandDefinitionMap()
  const columnsWithActions = useMemo(
    () => [
      ...columns,
      {
        id: 'actions',
        header: 'Actions',
        cell: ({row}) => (
          <CommandPopover
            hideGroupHeadings
            initialParams={{
              connection_id: row.original.id,
            }}
            ctx={{}}
            definitions={definitions}
          />
        ),
      } as ColumnDef<Core['connection']>,
    ],
    [deleteConn],
  )

  return (
    <div>
      <DataTable<Core['connection'], string | number | string[]>
        data={connectionData.data.items}
        columns={columnsWithActions}>
        <DataTable.Header>
          <DataTable.SearchInput />
          <DataTable.ColumnVisibilityToggle />
        </DataTable.Header>
        <DataTable.Table />
        <DataTable.Footer>
          <DataTable.Pagination />
        </DataTable.Footer>
      </DataTable>
    </div>
  )
}
