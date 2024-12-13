'use client'

import {_trpcReact} from '@openint/engine-frontend'
import {DataTable} from '@openint/ui'
import {VCommandMenu} from '@/vcommands/vcommand-components'

// TODO: Maybe allow filtering / sorting, also easily tell sources from destinations?

export default function ConnectionsPage() {
  const res = _trpcReact.listConnections.useQuery({})
  const filter = (c: {id: string}) => !c.id.includes('postgres_default')

  return (
    <div className="p-6">
      <header className="flex items-center">
        <h2 className="mb-4 mr-auto text-2xl font-semibold tracking-tight">
          Connections
        </h2>
        {/* <OpenIntConnectButton clientConnectors={clientConnectors} /> */}
      </header>
      <p className="mb-4 text-sm text-gray-600">Connections are created based on connector configurations.</p>
      <DataTable
        query={res}
        filter={filter}
        columns={[
          {
            id: 'actions',
            enableHiding: false,
            cell: ({row}) => (
              <VCommandMenu initialParams={{connection: row.original}} />
            ),
          },
          {accessorKey: 'displayName'},
          {accessorKey: 'customerId'},
          {accessorKey: 'id'},
          {accessorKey: 'status'},
          {accessorKey: 'connectorConfigId'},
          {accessorKey: 'integrationId'},
          {accessorKey: 'pipelineIds'},
        ]}
      />
    </div>
  )
}
