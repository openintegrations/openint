import {cn} from '@openint/shadcn/lib/utils'
import {BaseTableCell} from './BaseTableCell'
import {CopyID} from './CopyID'
import {Icon} from './Icon'
import {StatusDot, StatusType} from './StatusDot'

interface ConnectionTableCellProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Name of the connection
   */
  name: string
  /**
   * ID of the connection
   */
  id?: string
  /**
   * Status of the connection
   */
  status?: StatusType
  /**
   * Background color for the logo container
   */
  backgroundColor?: string
  /**
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
}

export function ConnectionTableCell({
  name,
  id,
  status = 'healthy',
  backgroundColor = '#f1f5f9', // Default light gray
  textColor = '#666666', // Default text color
  simple = false,
  compact = false,
  useIcon = false,
  className,
  ...props
}: ConnectionTableCellProps) {
  const logo = (
    <div
      className={cn(
        'relative flex items-center justify-center overflow-hidden rounded',
        compact ? 'h-8 w-8' : simple ? 'h-10 w-10' : 'h-[55px] w-[55px]',
      )}
      style={{backgroundColor}}>
      {useIcon ? (
        <Icon
          name="Link"
          size={compact ? 12 : simple ? 16 : 20}
          className="text-gray-600"
        />
      ) : (
        <span
          className={cn(
            'font-medium',
            compact ? 'text-xs' : simple ? 'text-xs' : 'text-base',
          )}
          style={{color: textColor}}>
          {name.substring(0, 2).toUpperCase()}
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
      <div className={cn('flex items-center gap-2', className)} {...props}>
        {logo}
        {id && <CopyID value={id} size="compact" width="auto" />}
      </div>
    )
  }

  return (
    <BaseTableCell
      name={name}
      logo={logo}
      id={id ? `CONNID_${id}` : undefined}
      status={status}
      simple={simple}
      className={className}
      {...props}
    />
  )
}
