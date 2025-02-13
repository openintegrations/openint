import {Loader2, Settings} from 'lucide-react'
import {useState} from 'react'
import type {ConnectorConfig} from '../../engine-frontend/hocs/WithConnectConfig'
import {Card, CardContent} from '../shadcn'
import {IntegrationLogo} from './ConnectionRawCard'
import {ConnectorLogo} from './ConnectorCard'

export function ConnectionCard({
  reconnectId,
  onSelect,
  conn,
}: {
  reconnectId: string | null
  onSelect: () => void
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
  const [isHovered, setIsHovered] = useState(false)
  let connectionName =
    conn?.integration?.name ?? conn.connectorConfig.connector.displayName
  connectionName =
    connectionName.charAt(0).toUpperCase() + connectionName.slice(1)

  return (
    <Card
      className="border-card-border relative h-[150px] w-[150px] cursor-pointer rounded-lg border bg-card p-0 transition-colors duration-300 ease-in-out hover:border-button hover:bg-button-light"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}>
      {/* Overlay spinner */}
      {reconnectId && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-md bg-card-loading">
          <Loader2 className="size-8 animate-spin text-button" />
        </div>
      )}

      <CardContent
        className="flex h-full flex-col items-center justify-center p-4 py-2"
        onClick={onSelect}>
        <div className="relative flex size-full flex-col items-center justify-center gap-1">
          {isHovered ? (
            <div className="flex h-full flex-col items-center justify-center">
              <Settings className="text-button" size={24} />
              <span className="mt-2 font-sans text-[14px] font-semibold text-button">
                Manage
              </span>
            </div>
          ) : (
            <>
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

              {conn.status !== 'healthy' && (
                <p
                  className={`text-center text-sm ${
                    reconnectId ? 'text-button' : 'text-red-500'
                  }`}>
                  {reconnectId ? 'Processing...' : 'Reconnect Required'}
                </p>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
