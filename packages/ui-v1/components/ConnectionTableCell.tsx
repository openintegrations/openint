import {cn} from '@openint/shadcn/lib/utils'
import {BaseTableCell} from './BaseTableCell'
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
  className,
  ...props
}: ConnectionTableCellProps) {
  const logo = (
    <div
      className={cn(
        'relative flex h-[55px] w-[55px] items-center justify-center overflow-hidden rounded',
        simple && 'h-10 w-10',
      )}
      style={{backgroundColor}}>
      <span
        className={cn('font-medium', simple ? 'text-xs' : 'text-base')}
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
      id={id ? `CONNID_${id}` : undefined}
      status={status}
      simple={simple}
      className={className}
      {...props}
    />
  )
}
