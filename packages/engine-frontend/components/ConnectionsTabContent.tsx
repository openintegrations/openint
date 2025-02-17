import {useSearchParams} from 'next/navigation'
import {useEffect, useState} from 'react'
import {Button, ConnectionDetails} from '@openint/ui'
import {DeleteConfirmation} from '@openint/ui/components/DeleteConfirmation'
import {ConnectionCard} from '@openint/ui/domain-components/ConnectionCard'
import type {ConnectorConfig} from '../hocs/WithConnectConfig'
import {WithConnectorConnect} from '../hocs/WithConnectorConnect'

interface Connection {
  id: string
  connectorConfig: ConnectorConfig
  connectorName: string
  pipelineIds: string[]
  integration: any
  status?: string | null
  statusMessage?: string | null
  createdAt: string
  envName?: string
  type?: string
}

interface ConnectionsTabContentProps {
  connectionCount: number
  deleteConnection: ({id}: {id: string}) => void
  isDeleting: boolean
  onConnect: () => void
  refetch: () => void
  connections: Connection[]
}

export function ConnectionsTabContent({
  connectionCount,
  deleteConnection,
  connections,
  isDeleting,
  onConnect,
  refetch,
}: ConnectionsTabContentProps) {
  const [resetKey, setResetKey] = useState(0)
  const [selectedConnection, setSelectedConnection] =
    useState<Connection | null>(null)
  const [reconnect, setReconnect] = useState<() => void>(() => {})
  const [showConfirmation, setShowConfirmation] = useState(false)
  // Is processing state is used for card loader on reconnect.
  const [reconnectId, setReconnectId] = useState<string | null>(null)
  // this is so that the timer in the connection card is reset
  const reset = () => setResetKey((prev) => prev + 1)
  const searchParams = useSearchParams()
  const view = searchParams.get('view') ?? ''
  const connectionId = searchParams.get('connectionId')
  const isDeeplinkView = view.split('-')[1] === 'deeplink'

  const openConfirmation = () => {
    setShowConfirmation(true)
  }

  useEffect(() => {
    if (isDeeplinkView) {
      const connection = connections.find((c) => c.id === connectionId)
      setSelectedConnection(connection ?? null)
    }
  }, [connections, isDeeplinkView, connectionId])

  const isOAuthConnector =
    selectedConnection?.status !== 'healthy' &&
    ((
      selectedConnection?.connectorConfig?.connector?.schemas
        ?.connectorConfig as any
    )?.required?.includes('oauth') as boolean)

  return (
    <>
      <DeleteConfirmation
        isOpen={showConfirmation}
        setIsOpen={setShowConfirmation}
        onDelete={() => {
          deleteConnection({id: selectedConnection?.id ?? ''})
        }}
        title="Delete Connection"
        description="Are you sure you want to delete this connection? This action cannot be undone."
        confirmText="Delete"
        isDeleting={isDeleting}
      />
      {selectedConnection && (
        <ConnectionDetails
          connection={selectedConnection}
          deleteConnection={openConfirmation}
          onClose={() => {
            if (!showConfirmation) {
              setSelectedConnection(null)
            }
          }}
          isDeleting={isDeleting}
          open={!!selectedConnection}
          isOAuthConnector={isOAuthConnector}
          onReconnect={() => {
            setReconnectId(selectedConnection.id)
            reconnect()
          }}
        />
      )}
      {connectionCount === 0 ? (
        <div className="flex flex-col p-4 pt-0">
          <div>
            <p className="font-semibold text-foreground">
              You have no connections yet
            </p>
            <p className="text-sm text-foreground">
              Add a connection to start integrating and streamlining your
              workflow!
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
                  onSelect={() => {
                    setSelectedConnection(conn)
                    setReconnect(() => openConnect)
                  }}
                  reconnectId={
                    conn.id === reconnectId ? (conn.id as string) : null
                  }
                />
              )}
            </WithConnectorConnect>
          ))}
        </div>
      )}
    </>
  )
}
