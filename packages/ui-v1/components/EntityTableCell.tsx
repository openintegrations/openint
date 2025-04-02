'use client'

import {cn} from '@openint/shadcn/lib/utils'
import {BaseTableCell} from './BaseTableCell'
import {CopyID} from './CopyID'
import {Icon} from './Icon'
import {StatusDot, StatusType} from './StatusDot'

export type EntityType =
  | 'customer'
  | 'connection'
  | 'integration'
  | 'connector-config'

interface EntityTableCellProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Type of entity being displayed
   */
  entityType: EntityType
  /**
   * Entity ID to display
   */
  id: string
  /**
   * Display name of the entity
   */
  name?: string
  /**
   * Whether to show the simple variant (logo and name only)
   */
  simple?: boolean
  /**
   * Whether to show the compact variant (just logo and ID, no name)
   */
  compact?: boolean
  /**
   * Whether to use an icon instead of initials
   */
  useIcon?: boolean
  /**
   * Status of the entity (if applicable)
   */
  status?: StatusType
  /**
   * Optional className for styling
   */
  className?: string
  /**
   * ID prefix to use (e.g., 'CUSID_')
   */
  idPrefix?: string
}

export function EntityTableCell(props: EntityTableCellProps) {
  const {
    entityType,
    id,
    name: providedName,
    simple = false,
    compact = false,
    useIcon = false,
    status,
    className,
    idPrefix,
    ...restProps
  } = props

  // Generate display name if not provided
  const displayName =
    providedName || `${getEntityLabel(entityType)} ${id.substring(0, 6)}`

  // Get the appropriate icon for the entity type
  const getIconName = () => {
    switch (entityType) {
      case 'customer':
        return 'User'
      case 'connection':
        return 'Network'
      case 'integration':
        return 'AppWindow'
      case 'connector-config':
        return 'Settings'
      default:
        return 'File'
    }
  }

  // Get entity label for display purposes
  function getEntityLabel(type: EntityType): string {
    switch (type) {
      case 'customer':
        return 'Customer'
      case 'connection':
        return 'Connection'
      case 'integration':
        return 'Integration'
      case 'connector-config':
        return 'Connector Config'
      default:
        return 'Entity'
    }
  }

  // Get ID prefix for the entity type
  const getFormattedId = () => {
    if (idPrefix) return `${idPrefix}${id}`

    switch (entityType) {
      case 'customer':
        return `CUSID_${id}`
      case 'connection':
        return id // Connections don't have a prefix
      case 'integration':
        return `INTID_${id}`
      case 'connector-config':
        return `CCFGID_${id}`
      default:
        return id
    }
  }

  // Determine logo text based on entity type and name
  const logoText =
    entityType === 'connection'
      ? 'CN'
      : displayName.substring(0, 2).toUpperCase()

  const logo = (
    <div
      className={cn(
        'bg-primary/15 relative flex h-[55px] w-[55px] items-center justify-center overflow-hidden rounded',
        compact && 'h-8 w-8',
        simple && 'h-10 w-10',
      )}>
      {useIcon ? (
        <Icon
          name={getIconName()}
          size={compact ? 12 : simple ? 16 : 20}
          className="text-primary"
        />
      ) : (
        <span
          className={cn(
            'text-primary font-semibold',
            compact ? 'text-xs' : simple ? 'text-xs' : 'text-base',
          )}>
          {logoText}
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
      <div className={cn('flex items-center gap-2', className)} {...restProps}>
        {logo}
        <CopyID value={id} size="compact" width="auto" />
      </div>
    )
  }

  return (
    <BaseTableCell
      name={displayName}
      logo={logo}
      id={getFormattedId()}
      status={status}
      simple={simple}
      className={className}
      {...restProps}
    />
  )
}
