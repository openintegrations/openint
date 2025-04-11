'use client'

import Image from 'next/image'
import React, {useState} from 'react'
import type {ConnectionExpanded} from '@openint/api-v1/routers/connection.models'
import {cn} from '@openint/shadcn/lib/utils'
import {CopyID} from '../../components/CopyID'
import {ConnectionCardContent} from '../ConnectionsCardView'

interface ConnectionTableCellProps
  extends React.HTMLAttributes<HTMLDivElement> {
  connection: ConnectionExpanded
  useLogo?: boolean
  className?: string
}

export function ConnectionTableCell({
  connection,
  useLogo = true,
  className,
  ...props
}: ConnectionTableCellProps) {
  const logoUrl = connection.connector?.logo_url

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

  const logo = (
    <div
      className={cn(
        'bg-primary/15 relative flex h-[55px] w-[55px] items-center justify-center overflow-hidden rounded-sm',
        'h-8 w-8',
      )}>
      {useLogo && logoUrl && (
        <Image
          src={logoUrl}
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
      {connection['id'] && (
        <CopyID value={String(connection['id'])} size="compact" width="auto" />
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
              />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
