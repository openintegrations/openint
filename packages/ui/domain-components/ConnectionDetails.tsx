import {ArrowLeft} from 'lucide-react'
import type {ConnectorConfig} from '../../engine-frontend/hocs/WithConnectConfig'
import {Button} from '../shadcn'
import {IntegrationLogo} from './ConnectionRawCard'
import {ConnectorLogo} from './ConnectorCard'

interface ConnectionDetailsProps {
  connection: {
    id: string
    connector_config: ConnectorConfig
    connector_name: string
    pipeline_ids: string[]
    sync_in_progress: boolean
    integration: any
    status?: string | null
    status_message?: string | null
    created_at: string
    env_name?: string
    type?: string
  }
  deleteConnection: ({id}: {id: string}) => void
  onClose: () => void
}

export function ConnectionDetails({
  connection,
  deleteConnection,
  onClose,
}: ConnectionDetailsProps) {
  return (
    <div className="flex flex-col gap-4 p-4 pt-2">
      <div className="grid grid-cols-1 gap-4 rounded-lg bg-muted p-6">
        <div className="flex items-center gap-2">
          <ArrowLeft
            className="h-6 w-6 cursor-pointer text-button hover:text-button-hover"
            onClick={onClose}
          />
          <h2 className="text-lg font-semibold text-foreground">
            Connection Details
          </h2>
        </div>
        <div className="flex items-center gap-4">
          {connection?.integration?.logo_url ||
          connection?.integration?.logoUrl ? (
            <IntegrationLogo
              integration={connection.integration}
              className="size-[64px] rounded-lg"
            />
          ) : (
            <ConnectorLogo
              connector={connection.connector_config.connector}
              className="size-[64px] rounded-lg"
            />
          )}
          {connection.connector_config?.connector_name && (
            <div>
              <p className="text-sm text-muted-foreground">Integration Name</p>
              <p className="font-medium">
                {connection.connector_config?.connector_name
                  ?.charAt(0)
                  .toUpperCase() +
                  connection.connector_config?.connector_name?.slice(1)}
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
            {connection.connector_config.display_name ||
              connection.connector_name}
          </p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Status</p>
          <p className="font-medium capitalize">
            {connection.status || 'Unknown'}
          </p>
        </div>
        <div className="flex justify-end">
          <Button
            variant="destructive"
            onClick={() => deleteConnection({id: connection.id})}
            className="h-9">
            Delete Connection
          </Button>
        </div>
      </div>
    </div>
  )
}
