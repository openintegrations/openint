'use client'

import Image from 'next/image'
import type {Core} from '@openint/api-v1/models'
import {cn} from '@openint/shadcn/lib/utils'
import {CopyID} from '../../components/CopyID'

interface ConnectionTableCellProps
  extends React.HTMLAttributes<HTMLDivElement> {
  connection: Core['connection_select']
  useLogo?: boolean
  className?: string
  logo_url?: string
}

export function ConnectionTableCell({
  connection,
  useLogo = true,
  className,
  logo_url,
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

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {logo}
      {connection.id && (
        <CopyID value={connection.id} size="compact" width="auto" />
      )}
    </div>
  )
}
