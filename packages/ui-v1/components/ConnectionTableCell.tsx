'use client'

import {Core} from '@openint/api-v1/models'
import {cn} from '@openint/shadcn/lib/utils'
import {BaseTableCell} from './BaseTableCell'
import {CopyID} from './CopyID'
import {Icon} from './Icon'
import {StatusDot, StatusType} from './StatusDot'

interface ConnectionTableCellProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Connection object
   */
  connection: Core['connection']
  /**
   * Whether to show the simple variant (logo and name only)
   */
  simple?: boolean
  /**
   * Whether to show the compact variant (just logo and ID, no name)
   */
  compact?: boolean
  /**
   * Whether to use a link icon instead of initials
   */
  useIcon?: boolean
  /**
   * Status of the connection (overrides automatic status detection)
   */
  status?: StatusType
  /**
   * Optional className for styling
   */
  className?: string
}

export function ConnectionTableCell(props: ConnectionTableCellProps) {
  const {connection} = props
  const status = props.status || 'healthy'
  const simple = props.simple || false
  const compact = props.compact || false
  const useIcon = props.useIcon || false
  const className = props.className

  // Extract other props
  const {
    connection: _,
    status: __,
    simple: ___,
    compact: ____,
    useIcon: _____,
    className: ______,
    ...restProps
  } = props

  const displayName = `Connection ${connection?.id?.substring(0, 6) || 'Unknown'}`
  const logoText = 'CN'

  const logo = (
    <div
      className={cn(
        'bg-primary/15 relative flex h-[55px] w-[55px] items-center justify-center overflow-hidden rounded',
        compact && 'h-8 w-8',
        simple && 'h-10 w-10',
      )}>
      {useIcon ? (
        <Icon
          name="Network"
          size={compact ? 12 : simple ? 16 : 20}
          className="text-primary"
        />
      ) : (
        <span
          className={cn(
            'text-primary font-medium',
            compact ? 'text-xs' : simple ? 'text-xs' : 'text-base',
          )}>
          {logoText}
        </span>
      )}
      {status && (
        <div
          className={cn(
            'absolute right-1 top-1',
            compact && 'right-0.5 top-0.5',
            simple && 'right-0.5 top-0.5',
          )}>
          <StatusDot
            status={status}
            className={compact ? 'h-1.5 w-1.5' : undefined}
          />
        </div>
      )}
    </div>
  )

  if (compact) {
    return (
      <div className={cn('flex items-center gap-2', className)} {...restProps}>
        {logo}
        {connection.id && (
          <CopyID value={connection.id} size="compact" width="auto" />
        )}
      </div>
    )
  }

  return (
    <BaseTableCell
      name={displayName}
      logo={logo}
      id={connection.id}
      status={status}
      simple={simple}
      className={className}
      {...restProps}
    />
  )
}
