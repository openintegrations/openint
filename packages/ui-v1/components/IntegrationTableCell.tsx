import {cn} from '@openint/shadcn/lib/utils'
import {BaseTableCell} from './BaseTableCell'
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
  className,
  ...props
}: IntegrationTableCellProps) {
  const logo = (
    <div
      className={cn(
        'relative flex h-[55px] w-[55px] items-center justify-center overflow-hidden rounded',
        simple && 'h-10 w-10',
      )}
      style={{backgroundColor: brandColor}}>
      <span
        className={cn('font-semibold', simple ? 'text-xs' : 'text-base')}
        style={{color: textColor}}>
        {name.substring(0, 2).toUpperCase()}
      </span>
      {status && (
        <div
          className={cn(
            'absolute right-1 top-1',
            simple && 'right-0.5 top-0.5',
          )}>
          <StatusDot status={status} />
        </div>
      )}
    </div>
  )

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
