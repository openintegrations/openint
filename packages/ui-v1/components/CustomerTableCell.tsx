import {cn} from '@openint/shadcn/lib/utils'
import {BaseTableCell} from './BaseTableCell'
import {CopyID} from './CopyID'
import {Icon} from './Icon'

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
   * Background color for the logo container
   */
  backgroundColor?: string
  /**
   * Text color for the initials or icon
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
   * Whether to use a person icon instead of initials
   */
  useIcon?: boolean
  /**
   * Optional className for styling
   */
  className?: string
}

export function CustomerTableCell({
  name,
  id,
  backgroundColor = '#f3e8ff', // Default purple light background
  textColor = '#9333ea', // Default purple text
  simple = false,
  compact = false,
  useIcon = false,
  className,
  ...props
}: CustomerTableCellProps) {
  const logo = (
    <div
      className={cn(
        'relative flex items-center justify-center overflow-hidden rounded',
        compact ? 'h-8 w-8' : simple ? 'h-10 w-10' : 'h-[55px] w-[55px]',
      )}
      style={{backgroundColor}}>
      {useIcon ? (
        <Icon
          name="User"
          size={compact ? 12 : simple ? 16 : 20}
          className="text-purple-600"
        />
      ) : (
        <span
          className={cn(
            'font-semibold',
            compact ? 'text-xs' : simple ? 'text-xs' : 'text-base',
          )}
          style={{color: textColor}}>
          {name.charAt(0).toUpperCase()}
        </span>
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
      id={id ? `CUSID_${id}` : undefined}
      simple={simple}
      className={className}
      {...props}
    />
  )
}
