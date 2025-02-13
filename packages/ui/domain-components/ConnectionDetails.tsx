import {Loader2} from 'lucide-react'
import type {ConnectorConfig} from '../../engine-frontend/hocs/WithConnectConfig'
import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from '../shadcn'
import {IntegrationLogo} from './ConnectionRawCard'
import {ConnectorLogo} from './ConnectorCard'

interface ConnectionDetailsProps {
  connection: {
    id: string
    connectorConfig: ConnectorConfig
    connectorName: string
    pipelineIds: string[]
    syncInProgress: boolean
    integration: any
    status?: string | null
    statusMessage?: string | null
    createdAt: string
    envName?: string
    type?: string
  }
  deleteConnection: ({id}: {id: string}) => void
  isDeleting: boolean
  isOAuthConnector: boolean
  onClose: () => void
  open: boolean
  onReconnect: () => void
}

export function ConnectionDetails({
  connection,
  deleteConnection,
  isDeleting,
  onClose,
  open,
  isOAuthConnector,
  onReconnect,
}: ConnectionDetailsProps) {
  return (
    <Dialog
      open={open}
      key={connection.id}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose()
      }}>
      <DialogContent>
        <DialogHeader>
          <h2 className="text-lg font-semibold text-foreground">
            Connection Details
          </h2>
          <div className="relative">
            {isDeleting && (
              <div className="absolute inset-0 z-10 flex items-center justify-center rounded-md bg-card-loading">
                <Loader2 className="size-8 animate-spin text-button" />
              </div>
            )}
            <div className="grid grid-cols-1 gap-4">
              <div className="flex items-center gap-4">
                {connection?.integration?.logo_url ||
                connection?.integration?.logoUrl ? (
                  <IntegrationLogo
                    integration={connection.integration}
                    className="size-[64px] rounded-lg"
                  />
                ) : (
                  <ConnectorLogo
                    connector={connection.connectorConfig.connector}
                    className="size-[64px] rounded-lg"
                  />
                )}
                {connection.connectorConfig?.connectorName && (
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Integration Name
                    </p>
                    <p className="font-medium">
                      {connection.connectorConfig?.connectorName
                        ?.charAt(0)
                        .toUpperCase() +
                        connection.connectorConfig?.connectorName?.slice(1)}
                    </p>
                  </div>
                )}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Connection ID</p>
                <p className="font-medium">{connection.id}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Connector Name</p>
                <p className="font-medium">
                  {connection.connectorConfig.displayName ||
                    connection.connectorName}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="font-medium capitalize">
                  {connection.status || 'Unknown'}
                </p>
              </div>
            </div>
          </div>
        </DialogHeader>
        <DialogFooter>
          {isOAuthConnector && (
            <Button variant="outline" onClick={onReconnect}>
              Reconnect
            </Button>
          )}
          <Button
            variant="destructive"
            onClick={() => deleteConnection({id: connection.id})}
            disabled={isDeleting}
            className="h-9">
            {isDeleting ? 'Deleting...' : 'Delete Connection'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
