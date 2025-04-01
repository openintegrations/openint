'use client'

import {Core} from '@openint/api-v1/models'
import {cn} from '@openint/shadcn/lib/utils'
import {BaseTableCell} from './BaseTableCell'
import {CopyID} from './CopyID'
import {Icon} from './Icon'
import {StatusDot, StatusType} from './StatusDot'

interface CustomerTableCellPropsObject
  extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Customer object
   */
  customer: Core['customer']
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
   * Status of the customer (if applicable)
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
   * Optional className for styling
   */
  className?: string
}

interface CustomerTableCellPropsProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * @deprecated Use customer.name instead
   * Name of the customer
   */
  name: string
  /**
   * @deprecated Use customer.id instead
   * ID of the customer
   */
  id?: string
  /**
   * Status of the customer
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
   * Whether to use a person icon instead of initials
   */
  useIcon?: boolean
  /**
   * Optional className for styling
   */
  className?: string
  /**
   * Customer object - used if provided instead of individual props
   */
  customer?: Core['customer']
}

export type CustomerTableCellProps =
  | CustomerTableCellPropsObject
  | CustomerTableCellPropsProps

export function CustomerTableCell(props: CustomerTableCellProps) {
  // Determine if we're using the object-based or property-based API
  const usingObjectAPI = 'customer' in props && props.customer !== undefined

  // Get values from the appropriate source
  const customer = usingObjectAPI ? props.customer : undefined

  // For object API, extract ID safely
  let customerId = ''
  if (
    usingObjectAPI &&
    customer &&
    typeof customer === 'object' &&
    'id' in customer
  ) {
    customerId = String(customer.id || '')
  } else if (!usingObjectAPI && 'id' in props) {
    customerId = String((props as CustomerTableCellPropsProps).id || '')
  }

  // For object API, extract name safely
  let customerName = ''
  if (usingObjectAPI && customer) {
    customerName = `Customer ${customerId ? customerId.substring(0, 6) : 'Unknown'}`
  } else if (!usingObjectAPI && 'name' in props) {
    customerName = (props as CustomerTableCellPropsProps).name
  }

  // If we still don't have a name, generate one from the ID
  if (!customerName) {
    customerName = customerId
      ? `Customer ${customerId.substring(0, 6)}`
      : 'Unknown Customer'
  }

  // For customers, use primary/accent for theming
  const status = props.status
  const simple = props.simple || false
  const compact = props.compact || false
  const useIcon = props.useIcon || false
  const className = props.className

  // Extract other props
  const {
    customer: _,
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

  const logo = (
    <div
      className={cn(
        'bg-primary/15 relative flex h-[55px] w-[55px] items-center justify-center overflow-hidden rounded',
        compact && 'h-8 w-8',
        simple && 'h-10 w-10',
      )}>
      {useIcon ? (
        <Icon
          name="User"
          size={compact ? 12 : simple ? 16 : 20}
          className="text-primary"
        />
      ) : (
        <span
          className={cn(
            'text-primary font-semibold',
            compact ? 'text-xs' : simple ? 'text-xs' : 'text-base',
          )}>
          {customerName.charAt(0).toUpperCase()}
        </span>
      )}
      {status && (
        <div
          className={cn(
            'absolute right-1 top-1',
            compact && 'right-0.5 top-0.5',
            simple && 'right-0.5 top-0.5',
          )}>
          <StatusDot status={status} />
        </div>
      )}
    </div>
  )

  if (compact) {
    return (
      <div className={cn('flex items-center gap-2', className)} {...restProps}>
        {logo}
        {customerId && (
          <CopyID value={customerId} size="compact" width="auto" />
        )}
      </div>
    )
  }

  return (
    <BaseTableCell
      name={customerName}
      logo={logo}
      id={customerId ? `CUSID_${customerId}` : undefined}
      status={status}
      simple={simple}
      className={className}
      {...restProps}
    />
  )
}
