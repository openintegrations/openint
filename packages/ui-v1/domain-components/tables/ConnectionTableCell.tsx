'use client'

import Image from 'next/image'
import React, {useState} from 'react'
import type {Core} from '@openint/api-v1/models'
import {cn} from '@openint/shadcn/lib/utils'
import {CopyID} from '../../components/CopyID'
import type {StatusType} from '../../components/StatusDot'
import {ConnectionCardContent} from '../ConnectionsCardView'

interface ConnectionTableCellProps
  extends React.HTMLAttributes<HTMLDivElement> {
  connection: Core['connection_select']
  useLogo?: boolean
  className?: string
  logo_url?: string
  status?: StatusType
  platform?: string
  version?: string
  authMethod?: string
}

export function ConnectionTableCell({
  connection,
  useLogo = true,
  className,
  logo_url,
  status,
  platform,
  version,
  authMethod,
  ...props
}: ConnectionTableCellProps) {
  const [open, setOpen] = useState(false)
  const [coords, setCoords] = useState({x: 0, y: 0})

  const handleMouseEnter = (e: React.MouseEvent) => {
    setOpen(true)
    setCoords({x: e.clientX, y: e.clientY})
  }

  const handleMouseLeave = () => {
    setOpen(false)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (open) {
      setCoords({x: e.clientX, y: e.clientY})
    }
  }

  // Use provided status or default to 'offline' as a safe fallback
  const connectionStatus: StatusType = status || 'offline'

  const logo = (
    <div
      className={cn(
        'bg-primary/15 relative flex h-[55px] w-[55px] items-center justify-center overflow-hidden rounded-sm',
        'h-8 w-8',
      )}>
      {useLogo && logo_url && (
        <Image
          src={logo_url}
          alt={`${connection.connector_name} logo`}
          width={100}
          height={100}
          className="text-primary"
        />
      )}
    </div>
  )

  const cellContent = (
    <div
      className={cn('flex items-center gap-2', className)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
      {...props}>
      {logo}
      {connection.id && (
        <CopyID value={connection.id} size="compact" width="auto" />
      )}
    </div>
  )

  return (
    <>
      {cellContent}
      {open && (
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
            <div className="bg-popover w-[480px] overflow-hidden rounded-md border p-0 shadow-md">
              <ConnectionCardContent
                connection={connection}
                status={connectionStatus}
                category={connection.connector_name}
                platform={platform}
                authMethod={
                  authMethod ||
                  (connection.settings?.oauth ? 'oauth' : 'apikey')
                }
                version={version}
              />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
