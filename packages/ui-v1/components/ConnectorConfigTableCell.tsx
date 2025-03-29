import {cn} from '@openint/shadcn/lib/utils'
import {BaseTableCell} from './BaseTableCell'
import {StatusDot, StatusType} from './StatusDot'

interface ConnectorConfigTableCellProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Name of the connector config
   */
  name: string
  /**
   * ID of the connector config
   */
  id?: string
  /**
   * Status of the connector config
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

export function ConnectorConfigTableCell({
  name,
  id,
  status = 'healthy',
  backgroundColor = '#e0f2fe', // Default light blue background
  textColor = '#0ea5e9', // Default blue text
  simple = false,
  className,
  ...props
}: ConnectorConfigTableCellProps) {
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
      id={id ? `CCFGID_${id}` : undefined}
      status={status}
      simple={simple}
      className={className}
      {...props}
    />
  )
}
