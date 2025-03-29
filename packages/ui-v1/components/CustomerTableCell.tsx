import {cn} from '@openint/shadcn/lib/utils'
import {BaseTableCell} from './BaseTableCell'
import {StatusDot, StatusType} from './StatusDot'

interface CustomerTableCellProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Name of the customer
   */
  name: string
  /**
   * ID of the customer
   */
  id?: string
  /**
   * Status of the customer
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

export function CustomerTableCell({
  name,
  id,
  status = 'healthy',
  backgroundColor = '#ffedd5', // Default orange/amber light background
  textColor = '#ea580c', // Default orange/amber text
  simple = false,
  className,
  ...props
}: CustomerTableCellProps) {
  const logo = (
    <div
      className={cn(
        'relative flex h-[55px] w-[55px] items-center justify-center overflow-hidden rounded',
        simple && 'h-10 w-10',
      )}
      style={{backgroundColor}}>
      <span
        className={cn('font-semibold', simple ? 'text-xs' : 'text-base')}
        style={{color: textColor}}>
        {name.charAt(0).toUpperCase()}
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
      id={id ? `CUSID_${id}` : undefined}
      status={status}
      simple={simple}
      className={className}
      {...props}
    />
  )
}
