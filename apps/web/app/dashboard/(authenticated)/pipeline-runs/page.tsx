'use client'

import {DataTable} from '@openint/ui'
import {trpcReact} from '@/lib-client/trpcReact'
import useRefetchOnSwitch from '../useRefetchOnSwitch'

export default function SyncRunsPage() {
  const res = trpcReact.listEvents.useQuery({
    name: 'sync.completed',
    since: 0,
  })

  ;(globalThis as any).listEvents = res

  useRefetchOnSwitch(res.refetch)

  return (
    <div className="p-6">
      <header className="flex items-center">
        <h2 className="mb-4 mr-auto text-2xl font-semibold tracking-tight">
          Pipeline runs
        </h2>
      </header>
      <DataTable
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        query={{...res, data: res.data?.items ?? []} as any}
        columns={[
          // {
          //   id: 'actions',
          //   enableHiding: false,
          //   cell: ({row}) => (
          //     <VCommandMenu initialParams={{pipeline: row.original}} />
          //   ),
          // },
          {accessorKey: 'id'},
          {accessorKey: 'data.source_id', header: 'Source ID'},
          {accessorKey: 'data.destination_id', header: 'Destination ID'},
          {accessorKey: 'data.pipeline_id', header: 'Pipeline ID'},
          {accessorKey: 'timestamp'},
          //  TODO: Add status, duration, sync metrics, and other fields...
          // {accessorKey: 'duration'},
          // // {accessorKey: 'input_event'}, // TODO: Handle json
          // {accessorKey: 'error_type'},
          // {accessorKey: 'error_details'},
          // // {accessorKey: 'metrics'}, // TODO: Handle json
          // {accessorKey: 'created_at'},
          // {accessorKey: 'updated_at'},
        ]}
      />
    </div>
  )
}
