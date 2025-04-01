import {cn} from '@openint/shadcn/lib/utils'
import {BaseTableCell} from './BaseTableCell'
import {CopyID} from './CopyID'
import {Icon} from './Icon'
import {StatusDot, StatusType} from './StatusDot'

interface IntegrationTableCellProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Name of the integration
   */
  name: string
  /**
   * ID of the integration
   */
  id?: string
  /**
   * Status of the integration
   */
  status?: StatusType
  /**
   * Brand color for the logo background
   */
  brandColor?: string
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
   * Whether to use an app icon instead of initials
   */
  useIcon?: boolean
  /**
   * Optional className for styling
   */
  className?: string
}

export function IntegrationTableCell({
  name,
  id,
  status = 'healthy',
  brandColor = '#f97316', // Default orange color
  textColor = '#ffffff', // Default white text
  simple = false,
  compact = false,
  useIcon = false,
  className,
  ...props
}: IntegrationTableCellProps) {
  const logo = (
    <div
      className={cn(
        'relative flex items-center justify-center overflow-hidden rounded',
        compact ? 'h-8 w-8' : simple ? 'h-10 w-10' : 'h-[55px] w-[55px]',
      )}
      style={{backgroundColor: brandColor}}>
      {useIcon ? (
        <Icon
          name="AppWindow"
          size={compact ? 12 : simple ? 16 : 20}
          className="text-white"
        />
      ) : (
        <span
          className={cn(
            'font-semibold',
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
      id={id ? `INTID_${id}` : undefined}
      status={status}
      simple={simple}
      className={className}
      {...props}
    />
  )
}
