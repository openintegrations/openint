import {Loader} from 'lucide-react'
import * as React from 'react'
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
  onDelete: ({id}: {id: string}) => void
  onReconnect: () => void
  conn: {
    id: string
    pipelineIds: string[]
    syncInProgress: boolean
    connectorConfig: ConnectorConfig
    integration: any
    status: string
    statusMessage: string
  }
}) {
  const [isSpinning, setIsSpinning] = React.useState(false)

  const handleReconnect = () => {
    setIsSpinning(true)
    onReconnect()
    setTimeout(() => {
      setIsSpinning(false)
    }, 60000) // ok as upon complete it will refresh
  }

  const handleDelete = () => {
    setIsSpinning(true)
    onDelete({id: conn.id})
    setTimeout(() => {
      setIsSpinning(false)
    }, 60000) // ok as upon complete it will refresh
  }

  let connectionName =
    conn?.integration?.name ?? conn.connectorConfig.connector.displayName
  connectionName =
    connectionName.charAt(0).toUpperCase() + connectionName.slice(1)

  const isOAuthConnector = (
    conn.connectorConfig.connector.schemas.connectorConfig as any
  )?.required?.includes('oauth')

  return (
    <Card className="border-card-border relative h-[150px] w-[150px] cursor-pointer rounded-lg border bg-card p-0">
      {/* Overlay spinner */}
      {isSpinning && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70">
          <Loader className="size-8 animate-spin text-button" />
        </div>
      )}

      <CardContent className="flex h-full flex-col items-center justify-center p-4 py-2">
        <div className="relative flex size-full flex-col items-center justify-center gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger className="absolute right-0 top-0">
              <Ellipsis className="size-5 text-foreground" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[120px]">
              {conn.status !== 'healthy' && isOAuthConnector && (
                <DropdownMenuItem
                  className="flex cursor-pointer items-center justify-center"
                  onSelect={() => handleReconnect()}>
                  <span className="text-center font-medium">Reconnect</span>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                className="flex cursor-pointer items-center justify-center"
                onSelect={() => handleDelete()}>
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
                Reconnect Required
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
