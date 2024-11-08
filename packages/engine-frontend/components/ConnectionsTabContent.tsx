import {Button} from '@openint/ui'
import {ConnectionCard} from '@openint/ui/domain-components/ConnectionCard'
import type {ConnectorConfig} from '../hocs/WithConnectConfig'

interface ConnectionsTabContentProps {
  connectionCount: number
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
      {connections.map((conn) => (
        <ConnectionCard key={conn.id} conn={conn} onDelete={deleteResource} />
      ))}
    </div>
  )
}
