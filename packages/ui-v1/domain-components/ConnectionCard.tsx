import type {ConnectionExpanded, ConnectorName} from '@openint/api-v1/models'

import {Settings} from 'lucide-react'
import {useState} from 'react'
import {cn} from '@openint/shadcn/lib/utils'
import {Card, CardContent} from '@openint/shadcn/ui'
import {titleCase} from '@openint/util/string-utils'
import {
  ConnectionStatusPill,
  getConnectionStatusStyles,
} from './ConnectionStatus'
import {ConnectorLogo} from './ConnectorLogo'

export interface ConnectionCardProps {
  connection: ConnectionExpanded
  onPress?: () => void
  onReconnect?: () => void
  className?: string
  variant?: 'default' | 'developer'
  children?: React.ReactNode
}

export function ConnectionCard({
  connection,
  onPress,
  onReconnect,
  className,
  variant = 'default',
  children,
}: ConnectionCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  const displayName =
    connection.integration?.name ||
    connection.connector?.display_name ||
    titleCase(connection.connector_name)

  const {borderColor} = getConnectionStatusStyles(connection.status)

  return (
    <Card
      className={cn(
        'border-card-border bg-card relative h-[150px] w-[150px] overflow-hidden rounded-lg border p-0',
        'group transition-all duration-300 ease-out hover:shadow-md',
        onPress
          ? 'hover:border-primary/50 hover:bg-primary/5 dark:hover:bg-primary/10 cursor-pointer'
          : '',
        isHovered && 'scale-[1.02]',
        connection.status !== 'healthy' && borderColor,
        className,
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}>
      <div
        className={cn(
          'pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300',
          'from-primary/10 via-primary/5 bg-gradient-to-br to-transparent',
          isHovered && 'opacity-100',
        )}
      />
      <CardContent
        className={cn(
          'relative z-10 flex h-full flex-col items-center justify-center p-4 py-2',
          isHovered && 'transition-transform duration-300',
        )}
        onClick={onPress}>
        <div className="relative flex size-full flex-col items-center justify-center gap-1">
          {isHovered && onPress ? (
            <div
              className={cn(
                'flex h-full flex-col items-center justify-center',
                'scale-95 opacity-0 group-hover:scale-100 group-hover:opacity-100',
                'transition-all duration-300 ease-out',
              )}>
              <Settings className="text-primary" size={24} />
              <span className="text-primary mt-2 font-sans text-[14px] font-semibold">
                Manage
              </span>
            </div>
          ) : (
            <>
              <div
                className={cn(
                  'flex flex-col items-center justify-center',
                  'transition-all duration-300 ease-out',
                  isHovered && 'scale-[1.03]',
                )}>
                <ConnectorLogo
                  connectorName={connection.connector_name as ConnectorName}
                  width={54}
                  height={54}
                  skipFallbackText
                />
                <p className="mt-2 w-full break-words text-center text-sm font-semibold">
                  {displayName}
                </p>
                {variant === 'developer' && (
                  <pre
                    className="text-muted-foreground w-full truncate text-center text-xs"
                    title={connection.id}>
                    {connection.id}
                  </pre>
                )}
                {connection.status && (
                  <ConnectionStatusPill
                    status={connection.status}
                    onClick={onReconnect}
                  />
                )}
              </div>
            </>
          )}
        </div>
        {children}
      </CardContent>
    </Card>
  )
}
