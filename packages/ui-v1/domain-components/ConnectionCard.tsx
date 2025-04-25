import type {ConnectionExpanded, ConnectorName} from '@openint/api-v1/models'

import {Settings} from 'lucide-react'
import React, {useRef, useState} from 'react'
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
  const cardRef = useRef<HTMLDivElement>(null)

  const displayName =
    connection.integration?.name ||
    connection.connector?.display_name ||
    titleCase(connection.connector_name)

  const {borderColor} = getConnectionStatusStyles(connection.status)

  const handleMouseEnter = () => {
    if (onPress) {
      setIsHovered(true)
    }
  }

  const handleMouseLeave = () => {
    if (onPress) {
      setIsHovered(false)
    }
  }

  return (
    <Card
      ref={cardRef}
      className={cn(
        'border-card-border bg-card relative h-[150px] w-[150px] rounded-lg border p-0',
        onPress
          ? 'hover:border-button hover:bg-button-light cursor-pointer transition-all duration-300 ease-in-out hover:scale-105'
          : 'hover:border-primary/20 transition-all duration-300 ease-in-out hover:scale-[1.02]',
        connection.status !== 'healthy' && borderColor,
        className,
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}>
      <CardContent
        className="flex h-full flex-col items-center justify-center p-4 py-2"
        onClick={onPress}>
        <div className="relative flex size-full flex-col items-center justify-center gap-1">
          {isHovered && onPress ? (
            <div className="flex h-full flex-col items-center justify-center">
              <Settings className="text-button" size={24} />
              <span className="text-button mt-2 font-sans text-[14px] font-semibold">
                Manage
              </span>
            </div>
          ) : (
            <>
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
            </>
          )}
        </div>
        {children}
      </CardContent>
    </Card>
  )
}
