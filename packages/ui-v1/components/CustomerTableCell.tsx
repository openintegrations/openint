'use client'

import {Core} from '@openint/api-v1/models'
import {EntityTableCell} from './EntityTableCell'
import {StatusType} from './StatusDot'

interface CustomerTableCellProps extends React.HTMLAttributes<HTMLDivElement> {
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
   * Optional className for styling
   */
  className?: string
}

export function CustomerTableCell(props: CustomerTableCellProps) {
  const {customer, status, simple, compact, useIcon, className, ...restProps} =
    props

  // Generate customer name from ID if not available
  const customerName = `Customer ${customer.id ? customer.id.substring(0, 6) : 'Unknown'}`

  // Use the EntityTableCell component with customer-specific configurations
  return (
    <EntityTableCell
      entityType="customer"
      id={customer.id}
      name={customerName}
      status={status}
      simple={simple}
      compact={compact}
      useIcon={useIcon}
      className={className}
      {...restProps}
    />
  )
}
