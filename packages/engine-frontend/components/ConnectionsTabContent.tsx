import {Loader} from 'lucide-react'
import {Fragment} from 'react'
import {Button, parseCategory} from '@openint/ui'
import {ConnectionCard} from '@openint/ui/domain-components/ConnectionCard'
import type {ConnectorConfig} from '../hocs/WithConnectConfig'

interface ConnectionsTabContentProps {
  connectionCount: number
  categoriesWithConnections: Array<{
    name: string
    connections: Array<{
      id: string
      connectorConfig: ConnectorConfig
      connectorName: string
      pipelineIds: string[]
      syncInProgress: boolean
    }>
  }>
  isLoading: boolean
  deleteResource: ({id}: {id: string}) => void
  onConnect: () => void
}

export function ConnectionsTabContent({
  connectionCount,
  isLoading,
  deleteResource,
  categoriesWithConnections,
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
    <div className="space-y-6 p-4">
      {isLoading ? (
        <div className="flex h-full items-center justify-center">
          <Loader className="size-5 animate-spin text-[#8A5DF6]" />
        </div>
      ) : (
        categoriesWithConnections.map((category) => (
          <div key={category.name} className="flex flex-col gap-2 space-y-4">
            <h3 className="text-lg font-semibold">
              {parseCategory(category.name)}
            </h3>
            {category.connections.map((conn) => (
              <Fragment key={conn.id}>
                <ConnectionCard conn={conn} onDelete={deleteResource} />
              </Fragment>
            ))}
          </div>
        ))
      )}
    </div>
  )
}
