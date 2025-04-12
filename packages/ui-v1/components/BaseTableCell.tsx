import type {StatusType} from './StatusDot'

import {cn} from '@openint/shadcn/lib/utils'
import {CopyID} from './CopyID'

interface BaseTableCellProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string
  logo?: React.ReactNode
  id?: string
  status?: StatusType
  simple?: boolean
  className?: string
}

export function BaseTableCell({
  name,
  logo,
  id,
  status,
  simple = false,
  className,
  ...props
}: BaseTableCellProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-3',
        simple ? 'py-1' : 'py-2',
        className,
      )}
      {...props}>
      <div className="relative flex-shrink-0">{logo}</div>
      {simple ? (
        <div className="flex items-center">
          <div className="text-sm font-medium">{name || 'Unknown'}</div>
        </div>
      ) : (
        <div className="flex h-[55px] flex-col justify-between">
          <div className="text-sm font-medium">{name || 'Unknown'}</div>
          {id && <CopyID value={id} width={280} size="medium" />}
        </div>
      )}
    </div>
  )
}
