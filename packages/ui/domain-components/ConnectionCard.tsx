import {CircleEllipsis, Loader} from 'lucide-react'
import type {ConnectorConfig} from '../../engine-frontend/hocs/WithConnectConfig'
import {
  Card,
  CardContent,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../shadcn'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../shadcn/Tooltip'
import {ConnectorLogo} from './ConnectorCard'
import {IntegrationLogo} from './ResourceCard'

export function ConnectionCard({
  onDelete,
  conn,
}: {
  onDelete: ({id}: {id: string}) => void
  conn: {
    id: string
    pipelineIds: string[]
    syncInProgress: boolean
    connectorConfig: ConnectorConfig
    integration: any
  }
}) {
  let connectionName =
    conn?.integration?.name ?? conn.connectorConfig.connector.displayName
  connectionName =
    connectionName.charAt(0).toUpperCase() + connectionName.slice(1)

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger className="flex size-full w-[150px] flex-col gap-1">
          <Card className="relative h-[150px] w-[150px] cursor-pointer rounded-lg border border-gray-300 bg-white p-0">
            <CardContent className="flex h-full flex-col items-center justify-center p-4 py-2">
              <div className="relative flex size-full flex-col items-center justify-center gap-1">
                <DropdownMenu>
                  <DropdownMenuTrigger className="absolute right-0 top-0">
                    <CircleEllipsis className="size-5 text-[#808080]" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="flex w-[80px] items-center justify-center">
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
                  {conn.syncInProgress ? (
                    <div className="flex flex-row items-center justify-start gap-2">
                      <Loader className="size-5 animate-spin text-button" />
                      <p className="text-center text-sm text-button">
                        Syncing...
                      </p>
                    </div>
                  ) : (
                    <p className="text-center text-sm text-[#808080]">Synced</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TooltipTrigger>
        <TooltipContent>
          {conn.connectorConfig.connector.displayName.charAt(0).toUpperCase() +
            conn.connectorConfig.connector.displayName.slice(1)}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
