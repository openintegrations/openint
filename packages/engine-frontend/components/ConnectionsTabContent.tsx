import {Loader} from 'lucide-react'
import {Button} from '@openint/ui'
import {ConnectionCard} from '@openint/ui/domain-components/ConnectionCard'
import type {ConnectorConfig} from '../hocs/WithConnectConfig'

interface ConnectionsTabContentProps {
  connectionCount: number
  isLoading: boolean
  deleteResource: ({id}: {id: string}) => void
  onConnect: () => void
  connections: Array<{
    id: string
    connectorConfig: ConnectorConfig
    connectorName: string
    pipelineIds: string[]
    syncInProgress: boolean
  }>
}

export function ConnectionsTabContent({
  connectionCount,
  isLoading,
  deleteResource,
  connections,
  onConnect,
}: ConnectionsTabContentProps) {
  return connectionCount === 0 ? (
    <div className="flex flex-col gap-2 p-4">
      <div>
        <p className="text-base font-semibold">No connections yet</p>
        <p className="text-base">Add a connection to get started</p>
      </div>
      <Button
        onClick={onConnect}
        className="h-10 items-center justify-center self-start">
        Visit Add a Connection
      </Button>
    </div>
  ) : (
    <div className="flex flex-row flex-wrap gap-4 p-4 lg:w-[70%]">
      {isLoading ? (
        <div className="flex h-full items-center justify-center">
          <Loader className="size-5 animate-spin text-[#8A5DF6]" />
        </div>
      ) : (
        connections.map((conn) => (
          <ConnectionCard key={conn.id} conn={conn} onDelete={deleteResource} />
        ))
      )}
    </div>
  )
}
