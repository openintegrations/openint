import {AlertCircle, CircleEllipsis, Loader} from 'lucide-react'
import type {ConnectorConfig} from '../../engine-frontend/hocs/WithConnectConfig'
import {
  Card,
  CardContent,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../shadcn'
import {ConnectorLogo} from './ConnectorCard'

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
  }
}) {
  return (
    <Card className="relative h-[150px] w-[150px] cursor-pointer rounded-lg border border-gray-300 bg-white p-0">
      <CardContent className="flex h-full flex-col items-center justify-center p-4">
        <div className="flex size-full flex-col items-center justify-center gap-1">
          <div className="flex w-full flex-row justify-between">
            <AlertCircle
              fill={conn.syncInProgress === undefined ? '#FF9500' : 'white'}
              stroke="white"
            />
            <DropdownMenu>
              <DropdownMenuTrigger>
                <CircleEllipsis className="size-5 self-end text-[#808080]" />
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
          </div>
          <ConnectorLogo
            connector={conn.connectorConfig.connector}
            className="size-[64px] rounded-lg"
          />
          <p
            className={`m-0 max-w-[100px] text-center text-sm font-semibold ${
              conn.connectorConfig.connector.displayName.length > 15
                ? 'truncate'
                : ''
            }`}>
            {conn.connectorConfig.connector.displayName
              .charAt(0)
              .toUpperCase() +
              conn.connectorConfig.connector.displayName.slice(1)}
          </p>
          {conn.pipelineIds.length > 0 && (
            <div>
              {conn.syncInProgress ? (
                <div className="flex flex-row items-center justify-start gap-2">
                  <Loader className="size-5 animate-spin text-button" />
                  <p className="text-center text-sm text-button">Syncing...</p>
                </div>
              ) : (
                <p className="text-center text-sm text-[#808080]">Synced</p>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
