'use client'

import Image from 'next/image'
import React from 'react'
import type {Core} from '@openint/api-v1/models'
import {cn} from '@openint/shadcn/lib/utils'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@openint/shadcn/ui/hover-card'
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
  category?: string
  platform?: string
  authMethod?: string
  version?: string
}

export function ConnectionTableCell({
  connection,
  useLogo = true,
  className,
  logo_url,
  status,
  category,
  platform,
  authMethod,
  version,
  ...props
}: ConnectionTableCellProps) {
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
    <div className={cn('flex items-center gap-2', className)} {...props}>
      {logo}
      {connection.id && (
        <CopyID value={connection.id} size="compact" width="auto" />
      )}
    </div>
  )

  return (
    <HoverCard openDelay={150} closeDelay={100}>
      <HoverCardTrigger asChild>{cellContent}</HoverCardTrigger>
      <HoverCardContent
        className="w-[480px] overflow-hidden p-0"
        align="start"
        side="right"
        sideOffset={5}>
        <ConnectionCardContent
          connection={connection}
          status={status || 'healthy'}
          category={category || connection.connector_name}
          platform={platform || 'Desktop'}
          authMethod={
            authMethod || (connection.settings?.oauth ? 'oauth' : 'apikey')
          }
          version={version || 'V1'}
        />
      </HoverCardContent>
    </HoverCard>
  )
}
