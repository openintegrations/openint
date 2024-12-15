import {Button} from '@openint/ui'
import {ConnectionCard} from '@openint/ui/domain-components/ConnectionCard'
import type {ConnectorConfig} from '../hocs/WithConnectConfig'
import {Id} from '@openint/cdk'
import {WithConnectorConnect} from '../hocs/WithConnectorConnect'

interface ConnectionsTabContentProps {
  connectionCount: number
  deleteConnection: ({id}: {id: Id<'conn'>}) => void
  onConnect: () => void
  onReconnect: ({id}: {id: Id<'conn'>}) => void
  connections: Array<{
    id: Id<'conn'>
    connectorConfig: ConnectorConfig
    connectorName: string
    pipelineIds: string[]
    syncInProgress: boolean
    integration: any
  }>
}

export function ConnectionsTabContent({
  connectionCount,
  deleteConnection,
  onReconnect,
  connections,
  onConnect,
}: ConnectionsTabContentProps) {
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
      {connections.map((conn) => (
            <WithConnectorConnect
              key={conn.id + ''}
              connectorConfig={{
                id: conn.connectorConfig.id,
                connector: conn.connectorConfig.connector,
              }}
              integration={conn.integration}
              connection={conn}
              onEvent={(e) => {
                console.log('ConnectionsTabContent WithConnectorConnect event', e)
                // TODO: review
                // onReconnect({id: conn.id})
                // onEvent?.({
                //   type: e.type,
                //   integration: {
                //     connectorConfigId: int.connector_config_id,
                //     id: int.id,
                //   },
                // })
              }}>
              {({openConnect}) => (
                // TODO: handle on reconnect to parent? 
                <ConnectionCard key={conn.id + ''} conn={conn} onDelete={deleteConnection} onReconnect={openConnect} />
              )}
          </WithConnectorConnect>
      ))}
    </div>
  )
}
