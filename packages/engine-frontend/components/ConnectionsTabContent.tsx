import {useState} from 'react'
import {Button} from '@openint/ui'
import {ConnectionCard} from '@openint/ui/domain-components/ConnectionCard'
import type {ConnectorConfig} from '../hocs/WithConnectConfig'
import {WithConnectorConnect} from '../hocs/WithConnectorConnect'

interface ConnectionsTabContentProps {
  connectionCount: number
  deleteConnection: ({id}: {id: string}) => void
  onConnect: () => void
  refetch: () => void
  connections: Array<{
    id: string
    connectorConfig: ConnectorConfig
    connectorName: string
    pipelineIds: string[]
    syncInProgress: boolean
    integration: any
    status?: string | null
    statusMessage?: string | null
  }>
}

export function ConnectionsTabContent({
  connectionCount,
  deleteConnection,
  connections,
  onConnect,
  refetch,
}: ConnectionsTabContentProps) {
  const [resetKey, setResetKey] = useState(0)
  // this is so that the timer in the connection card is reset
  const reset = () => setResetKey((prev) => prev + 1)

  return connectionCount === 0 ? (
    <div className="flex flex-col p-4 pt-0">
      <div>
        <p className="font-semibold text-foreground">
          You have no connections yet
        </p>
        <p className="text-sm text-foreground">
          Add a connection to start integrating and streamlining your workflow!
        </p>
      </div>
      <div
        className="my-4"
        style={{width: '250px', borderTop: '1px solid #E6E6E6'}}
      />
      <Button
        onClick={onConnect}
        className="h-10 items-center justify-center self-start">
        Visit Add a Connection
      </Button>
    </div>
  ) : (
    <div className="flex flex-row flex-wrap gap-4 p-4 lg:w-[70%]">
      {connections.map((conn: any) => (
        <WithConnectorConnect
          key={conn.id + ''}
          connectorConfig={{
            id: conn.connectorConfig.id,
            connector: conn.connectorConfig.connector,
          }}
          integration={conn.integration}
          connection={conn}
          onEvent={(event) => {
            if (event.type === 'success' || event.type === 'error') {
              refetch()
              reset()
            }
          }}>
          {({openConnect}) => (
            <ConnectionCard
              key={`${conn.id}-${resetKey}`}
              conn={conn}
              onDelete={deleteConnection}
              onReconnect={openConnect}
            />
          )}
        </WithConnectorConnect>
      ))}
    </div>
  )
}
