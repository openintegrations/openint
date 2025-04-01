'use client'

import {Core} from '@openint/api-v1/models'
import {cn} from '@openint/shadcn/lib/utils'
import {BaseTableCell} from './BaseTableCell'
import {CopyID} from './CopyID'
import {Icon} from './Icon'
import {StatusDot, StatusType} from './StatusDot'

interface ConnectionTableCellPropsObject
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
   * @deprecated Use the default theme styling
   * Optional backgroundColor for the logo
   */
  backgroundColor?: string
  /**
   * @deprecated Use the default theme styling
   * Optional textColor for the logo text
   */
  textColor?: string
  /**
   * Optional className for styling
   */
  className?: string
}

interface ConnectionTableCellPropsProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * @deprecated Use connection.id instead
   * ID of the connection
   */
  id: string
  /**
   * @deprecated Use connection.name instead
   * Name of the connection
   */
  name: string
  /**
   * Status of the connection
   */
  status?: StatusType
  /**
   * @deprecated Use the default theme styling
   * Brand color for the logo background
   */
  backgroundColor?: string
  /**
   * @deprecated Use the default theme styling
   * Text color for the initials
   */
  textColor?: string
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
   * Optional className for styling
   */
  className?: string
  /**
   * Connection object - used if provided instead of individual props
   */
  connection?: Core['connection']
}

export type ConnectionTableCellProps =
  | ConnectionTableCellPropsObject
  | ConnectionTableCellPropsProps

export function ConnectionTableCell(props: ConnectionTableCellProps) {
  // Determine if we're using the object-based or property-based API
  const usingObjectAPI = 'connection' in props && props.connection !== undefined

  // Get values from the appropriate source
  const connection = usingObjectAPI ? props.connection : undefined
  const name = usingObjectAPI
    ? `Connection ${connection?.id?.substring(0, 6) || 'Unknown'}`
    : (props as ConnectionTableCellPropsProps).name
  const id = usingObjectAPI
    ? connection?.id
    : (props as ConnectionTableCellPropsProps).id
  const status = props.status || 'healthy'
  const simple = props.simple || false
  const compact = props.compact || false
  const useIcon = props.useIcon || false
  const className = props.className

  // Extract other props
  const {
    connection: _,
    name: __,
    id: ___,
    status: ____,
    backgroundColor: _____,
    textColor: ______,
    simple: _______,
    compact: ________,
    useIcon: _________,
    className: __________,
    ...restProps
  } = props as any

  const connectionName = `Connection ${connection?.id?.substring(0, 6) || 'Unknown'}`
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
        {id && <CopyID value={id} size="compact" width="auto" />}
      </div>
    )
  }

  return (
    <BaseTableCell
      name={name}
      logo={logo}
      id={id}
      status={status}
      simple={simple}
      className={className}
      {...restProps}
    />
  )
}
