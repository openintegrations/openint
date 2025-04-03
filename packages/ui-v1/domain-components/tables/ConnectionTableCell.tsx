'use client'

import Image from 'next/image'
import {Core} from '@openint/api-v1/models'
import {cn} from '@openint/shadcn/lib/utils'
import {CopyID} from '../../components/CopyID'
import {getConnectorLogoUrl} from '../../utils'

interface ConnectionTableCellProps
  extends React.HTMLAttributes<HTMLDivElement> {
  connection: Core['connection']
  useLogo?: boolean
  className?: string
}

export function ConnectionTableCell({
  connection,
  useLogo = true,
  className,
}: ConnectionTableCellProps) {
  const logo = (
    <div
      className={cn(
        'bg-primary/15 relative flex h-[55px] w-[55px] items-center justify-center overflow-hidden rounded',
        'h-8 w-8',
      )}>
      {useLogo && (
        <Image
          src={getConnectorLogoUrl(connection.connector_name)}
          alt={`${connection.connector_name} logo`}
          width={2}
          height={12}
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
