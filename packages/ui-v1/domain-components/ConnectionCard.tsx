import type {ConnectionExpanded} from '@openint/api-v1/trpc/routers/connection.models'

import {Settings} from 'lucide-react'
import Image from 'next/image'
import React, {useState} from 'react'
import {cn} from '@openint/shadcn/lib/utils'
import {Card, CardContent, Separator} from '@openint/shadcn/ui'
import {titleCase} from '@openint/util/string-utils'
import {PropertyListView} from '../components/PropertyListView'

export interface ConnectionCardProps {
  connection: ConnectionExpanded
  onPress?: () => void
  className?: string
  variant?: 'default' | 'developer'
  children?: React.ReactNode
}

// Content
function ConnectionHoverContent({
  connection,
}: {
  connection: ConnectionExpanded
}) {
  const logoUrl =
    connection.integration?.logo_url || connection.connector?.logo_url

  const displayName =
    connection.integration?.name ||
    connection.connector?.display_name ||
    titleCase(connection.connector_name)
  const properties = [
    {title: 'Category', value: connection.connector_name || ''},
    {
      title: 'Platform',
      value: connection.connector?.platforms?.[0] || 'Desktop',
    },
    {
      title: 'Auth Method',
      value: connection.settings?.oauth ? 'OAuth' : 'API Key',
    },
    {title: 'Status', value: connection.status || 'Unknown'},
  ]

  return (
    <>
      <div className="flex items-center gap-3 p-4">
        <div className="bg-muted/30 border-border/30 flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-md border">
          {logoUrl ? (
            <Image
              src={logoUrl}
              alt={`${displayName} logo`}
              width={32}
              height={32}
              className="object-contain"
            />
          ) : (
            <div className="bg-primary/10 text-primary flex h-full w-full items-center justify-center rounded font-medium">
              {displayName.substring(0, 2).toUpperCase()}
            </div>
          )}
        </div>
        <div className="flex flex-col">
          <div className="text-lg font-medium">{displayName}</div>
        </div>
      </div>

      <Separator />

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
                <div className="bg-muted/30 border-border/30 mb-2 rounded-lg border p-1.5">
                  {logoUrl ? (
                    <Image
                      src={logoUrl}
                      alt={`${displayName} logo`}
                      width={48}
                      height={48}
                      className="object-contain"
                    />
                  ) : (
                    <div className="bg-primary/10 text-primary flex h-12 w-12 items-center justify-center rounded-lg font-medium">
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
