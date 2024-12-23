'use client'

import {DataTable} from '@openint/ui'
import {trpcReact} from '@/lib-client/trpcReact'
import useRefetchOnSwitch from '../useRefetchOnSwitch'

export default function SyncRunsPage() {
  const res = trpcReact.listSyncRuns.useQuery()

  ;(globalThis as any).listSyncRunsRes = res

  useRefetchOnSwitch(res.refetch)

  return (
    <div className="p-6">
      <header className="flex items-center">
        <h2 className="mb-4 mr-auto text-2xl font-semibold tracking-tight">
          Pipeline runs
        </h2>
      </header>
      <DataTable
        query={res}
        columns={[
          // {
          //   id: 'actions',
          //   enableHiding: false,
          //   cell: ({row}) => (
          //     <VCommandMenu initialParams={{pipeline: row.original}} />
          //   ),
          // },
          {accessorKey: 'id'},
          {accessorKey: 'connection_id'},
          {accessorKey: 'status'},
          {accessorKey: 'duration'},
          // {accessorKey: 'input_event'}, // TODO: Handle json
          {accessorKey: 'error_type'},
          {accessorKey: 'error_details'},
          // {accessorKey: 'metrics'}, // TODO: Handle json
          {accessorKey: 'created_at'},
          {accessorKey: 'updated_at'},
        ]}
      />
    </div>
  )
}
