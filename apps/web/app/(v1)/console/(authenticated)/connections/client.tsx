'use client'

import {Loader2, Trash} from 'lucide-react'
import {useMemo} from 'react'
import {Core} from '@openint/api-v1/models'
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
import {DataTable, type ColumnDef} from '@openint/ui-v1/components/DataTable'
import {useMutation, useSuspenseQuery} from '@openint/ui-v1/trpc'
import {useTRPC} from '../client'

const columns: ColumnDef<Core['connection']>[] = [
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
      onSuccess: () => {
        connectionData.refetch()
      },
      onError: (error) => {
        // TODO: @rodri77 - Add a toast to the UI.
        console.error(error)
      },
    }),
  )

  const columnsWithActions = useMemo(
    () => [
      ...columns,
      {
        id: 'actions',
        header: 'Actions',
        cell: ({row}) => {
          return (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Trash className="size-6 text-red-500" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Connection</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this connection? This action
                    cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={deleteConn.isPending}>
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    disabled={deleteConn.isPending}
                    onClick={() => deleteConn.mutate({id: row.original.id})}>
                    {deleteConn.isPending ? (
                      <>
                        <Loader2 className="mr-2 size-4 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      'Delete'
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
                {deleteConn.isPending && (
                  <div className="bg-background/80 absolute inset-0 flex items-center justify-center">
                    <Loader2 className="size-8 animate-spin" />
                  </div>
                )}
              </AlertDialogContent>
            </AlertDialog>
          )
        },
      } as ColumnDef<Core['connection']>,
    ],
    [columns, deleteConn],
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
