/* eslint-disable @typescript-eslint/no-confusing-void-expression */
import {Settings} from 'lucide-react'
import Image from 'next/image'
import React, {useState} from 'react'
import type {ConnectionExpanded} from '@openint/api-v1/models'
import {cn} from '@openint/shadcn/lib/utils'
import {Card, CardContent, Separator, Badge} from '@openint/shadcn/ui'
import {titleCase} from '@openint/util/string-utils'
import {PropertyListView} from '../components/PropertyListView'
import {StatusDot, type StatusType} from '../components/StatusDot'

export interface ConnectionCardProps {
  connection: ConnectionExpanded<'integration' | 'connector'>
  onPress?: () => void
  className?: string
  variant?: 'default' | 'developer'
  children?: React.ReactNode
}

// Convert API connection status to UI StatusType
function mapApiStatusToUiStatus(apiStatus?: string): StatusType {
  if (!apiStatus) return 'offline'
  
  switch (apiStatus) {
    case 'healthy': return 'healthy'
    case 'error': return 'destructive'
    case 'disconnected': return 'warning'
    case 'manual':
    default: return 'offline'
  }
}

// Simple content component for the hover popover
function ConnectionHoverContent({connection}: {connection: ConnectionExpanded<'integration' | 'connector'>}) {
  const logoUrl =
    connection.integration?.logo_url || connection.connector?.logo_url
  
  const displayName =
    connection.integration?.name ||
    connection.connector?.display_name ||
    titleCase(connection.connector_name)
  
  // Get connection status
  const apiStatus = (connection as any).status
  const uiStatus = mapApiStatusToUiStatus(apiStatus)
  
  // Status label mapping
  const statusLabels = {
    healthy: 'Connected',
    warning: 'Warning',
    destructive: 'Error', 
    offline: 'Offline'
  }
  
  const properties = [
    {title: 'Category', value: connection.connector_name || ''},
    {title: 'Platform', value: 'Desktop'},
    {title: 'Auth Method', value: connection.settings?.oauth ? 'oauth' : 'apikey'},
    {title: 'Version', value: 'V2'},
    {title: 'Status', value: apiStatus || 'Unknown'},
  ]
  
  return (
    <>
      {/* Header with logo and name.*/}
      <div className="flex items-center gap-3 p-4">
        <div className="bg-muted/30 border border-border/30 flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-md">
          {logoUrl ? (
            <Image
              src={logoUrl}
              alt={`${displayName} logo`}
              width={32}
              height={32}
              className="object-contain"
            />
          ) : (
            <div className="bg-primary/10 text-primary font-medium flex items-center justify-center rounded w-full h-full">
              {displayName.substring(0, 2).toUpperCase()}
            </div>
          )}
        </div>
        <div className="flex flex-col">
          <div className="font-medium text-lg">{displayName}</div>
          {apiStatus && (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <StatusDot status={uiStatus} />
              <span>{statusLabels[uiStatus]}</span>
            </div>
          )}
        </div>
      </div>
      
      <Separator />
      
      {/* Properties */}
      <div className="p-4">
        <PropertyListView properties={properties} />
      </div>
    </>
  )
}

export function ConnectionCard({
  connection,
  onPress,
  className,
  variant = 'default',
  children,
}: ConnectionCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [showPopover, setShowPopover] = useState(false)
  const [coords, setCoords] = useState({x: 0, y: 0})

  const logoUrl =
    connection.integration?.logo_url || connection.connector?.logo_url

  const displayName =
    connection.integration?.name ||
    connection.connector?.display_name ||
    titleCase(connection.connector_name)

  const handleMouseEnter = (e: React.MouseEvent) => {
    if (onPress) {
      setIsHovered(true)
    } else {
      // Only show popover if not clickable
      setShowPopover(true)
      setCoords({x: e.clientX, y: e.clientY})
    }
  }

  const handleMouseLeave = () => {
    if (onPress) {
      setIsHovered(false)
    } else {
      setShowPopover(false)
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (showPopover) {
      setCoords({x: e.clientX, y: e.clientY})
    }
  }

  return (
    <>
      <Card
        className={cn(
          'border-card-border bg-card relative h-[150px] w-[150px] rounded-lg border p-0',
          onPress
            ? 'hover:border-button hover:bg-button-light cursor-pointer transition-colors duration-300 ease-in-out'
            : 'hover:border-primary/20 transition-colors duration-300 ease-in-out',
          className,
        )}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseMove={handleMouseMove}>
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
                <div className="bg-muted/30 border border-border/30 rounded-lg p-1.5 mb-2">
                  {logoUrl ? (
                    <Image
                      src={logoUrl}
                      alt={`${displayName} logo`}
                      width={48}
                      height={48}
                      className="object-contain"
                    />
                  ) : (
                    <div className="bg-primary/10 text-primary font-medium flex items-center justify-center rounded-lg w-12 h-12">
                      {displayName.substring(0, 2).toUpperCase()}
                    </div>
                  )}
                </div>
                <p className="mt-1 w-full break-words text-center text-sm font-semibold">
                  {displayName}
                </p>
                {variant === 'developer' && (
                  <pre
                    className="text-muted-foreground w-full truncate text-center text-xs"
                    title={connection.id}>
                    {connection.id}
                  </pre>
                )}
              </>
            )}
          </div>
          {children}
        </CardContent>
      </Card>

      {showPopover && !isHovered && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            pointerEvents: 'none',
            width: '100vw',
            height: '100vh',
            zIndex: 50,
          }}>
          <div
            style={{
              position: 'absolute',
              left: `${coords.x}px`,
              top: `${coords.y}px`,
              transform: 'translate(10px, -50%)',
              pointerEvents: 'auto',
            }}>
            <div className="bg-popover w-[380px] overflow-hidden rounded-md border p-0 shadow-md">
              <ConnectionHoverContent connection={connection} />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
