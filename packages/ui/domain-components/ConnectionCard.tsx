import {Loader} from 'lucide-react'
import {Id} from '@openint/cdk'
import type {ConnectorConfig} from '../../engine-frontend/hocs/WithConnectConfig'
import {Ellipsis} from '../components'
import {
  Card,
  CardContent,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../shadcn'
import {IntegrationLogo} from './ConnectionRawCard'
import {ConnectorLogo} from './ConnectorCard'

export function ConnectionCard({
  onDelete,
  onReconnect,
  conn,
}: {
  onDelete: ({id}: {id: Id<'conn'>}) => void
  onReconnect: ({id}: {id: Id<'conn'>}) => void
  conn: {
    id: Id<'conn'>
    pipelineIds: string[]
    syncInProgress: boolean
    connectorConfig: ConnectorConfig
    integration: any
    status: string
    statusMessage: string
  }
}) {
  let connectionName =
    conn?.integration?.name ?? conn.connectorConfig.connector.displayName
  connectionName =
    connectionName.charAt(0).toUpperCase() + connectionName.slice(1)

  return (
    <Card className="border-card-border relative h-[150px] w-[150px] cursor-pointer rounded-lg border bg-card p-0">
      <CardContent className="flex h-full flex-col items-center justify-center p-4 py-2">
        <div className="relative flex size-full flex-col items-center justify-center gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger className="absolute right-0 top-0">
              <Ellipsis className="size-5 text-foreground" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="flex w-[80px] items-center justify-center">
              {conn.status !== 'healthy' && (
                <DropdownMenuItem
                  className="flex items-center justify-center"
                  onSelect={() => onReconnect({id: conn.id})}>
                  <span className="text-center font-medium">Reconnect</span>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                className="flex items-center justify-center"
                onSelect={() => onDelete({id: conn.id})}>
                <span className="text-center font-medium text-red-500">
                  Delete
                </span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {conn?.integration?.logo_url || conn?.integration?.logoUrl ? (
            <IntegrationLogo
              integration={conn.integration}
              className="size-[64px] rounded-lg"
            />
          ) : (
            <ConnectorLogo
              connector={conn.connectorConfig.connector}
              className="size-[64px] rounded-lg"
            />
          )}
          <p
            className={`m-0 max-w-[100px] text-center text-sm font-semibold ${
              conn.connectorConfig.connector.displayName.length > 15
                ? 'truncate'
                : ''
            }`}>
            {connectionName}
          </p>
          <div>
            {conn.status !== 'healthy' ? (
              <p className="text-center text-sm text-red-500">
                Reconnection Required
              </p>
            ) : conn.syncInProgress ? (
              <div className="flex flex-row items-center justify-start gap-2">
                <Loader className="size-5 animate-spin text-button" />
                <p className="text-center text-sm text-button">Syncing...</p>
              </div>
            ) : (
              <p className="text-center text-sm text-[#808080]">Synced</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
