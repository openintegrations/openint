'use client'

import {cn} from '@openint/shadcn/lib/utils'
import {CopyID} from './CopyID'
import {Icon} from './Icon'
import {StatusDot, StatusType} from './StatusDot'

export interface ConnectorConfigTableCellProps {
  /**
   * The name of the connector configuration
   */
  name: string
  /**
   * The ID of the connector configuration
   */
  id: string
  /**
   * Whether to use the compact variant of the cell
   */
  compact?: boolean
  /**
   * Whether to include an icon
   */
  useIcon?: boolean
  /**
   * Background color for the logo
   */
  backgroundColor?: string
  /**
   * Text color for the logo
   */
  textColor?: string
  /**
   * Optional className for styling
   */
  className?: string
  /**
   * Status of the connector config
   */
  status?: StatusType
  /**
   * Whether to show the simple variant (logo and name only)
   */
  simple?: boolean
}

export function ConnectorConfigTableCell({
  name,
  id,
  compact = false,
  useIcon = false,
  backgroundColor = '#f1f5f9',
  textColor = '#666666',
  className,
  status,
  simple = false,
}: ConnectorConfigTableCellProps) {
  // Get first letter of the name for the logo (or first two for consistency with ConnectionTableCell)
  const initials = name.substring(0, 2).toUpperCase()

  // Create the logo/avatar element with consistent styling
  const logo = (
    <div
      className={cn(
        'relative flex items-center justify-center overflow-hidden rounded',
        compact ? 'h-8 w-8' : simple ? 'h-10 w-10' : 'h-[55px] w-[55px]',
      )}
      style={{backgroundColor}}>
      {useIcon ? (
        <Icon
          name="Settings"
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
          {initials}
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

  // Compact variant only shows logo and CopyID
  if (compact) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        {logo}
        <CopyID value={id} size="compact" width="auto" />
      </div>
    )
  }

  // Simple variant shows logo and name, but no ID
  if (simple) {
    return (
      <div className={cn('flex items-center gap-3', className)}>
        {logo}
        <span className="text-sm font-medium text-gray-900">{name}</span>
      </div>
    )
  }

  // Regular variant shows logo, name, and ID
  return (
    <div className={cn('flex items-start gap-3', 'py-2', className)}>
      {logo}

      {/* Name and ID */}
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-900">{name}</span>
          {useIcon && (
            <Icon name="Settings" className="text-gray-400" size={16} />
          )}
        </div>
        <div className="mt-1">
          <CopyID value={`CCFGID_${id}`} size="medium" />
        </div>
      </div>
    </div>
  )
}
