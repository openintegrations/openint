'use client'

import type {Core} from '@openint/api-v1/models'
import type {StatusType} from '../../components/StatusDot'

import {cn} from '@openint/shadcn/lib/utils'
import {BaseTableCell} from '../../components/BaseTableCell'
import {CopyID} from '../../components/CopyID'
import {Icon} from '../../components/Icon'
import {StatusDot} from '../../components/StatusDot'

export type EntityType = keyof Core

interface EntityTableCellProps extends React.HTMLAttributes<HTMLDivElement> {
  entityType: EntityType
  id: string
  name?: string
  simple?: boolean
  compact?: boolean
  useIcon?: boolean
  status?: StatusType
  className?: string
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
      case 'customer_select':
        return 'User'
      case 'connection_select':
        return 'Network'
      case 'integration_select':
        return 'AppWindow'
      case 'connector_config_select':
        return 'Settings'
      default:
        return 'File'
    }
  }

  function getEntityLabel(type: EntityType): string {
    switch (type) {
      case 'customer_select':
        return 'Customer'
      case 'connection_select':
        return 'Connection'
      case 'integration_select':
        return 'Integration'
      case 'connector_config_select':
        return 'Connector Config'
      default:
        return 'Entity'
    }
  }

  const logo = (
    <div
      className={
        useIcon
          ? cn(
              'bg-primary/15 relative flex h-[55px] w-[55px] items-center justify-center overflow-hidden rounded',
              compact && 'h-8 w-8',
              simple && 'h-10 w-10',
            )
          : ''
      }>
      {useIcon && (
        <Icon
          name={getIconName()}
          size={compact ? 12 : simple ? 16 : 20}
          className="text-primary"
        />
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
      <div
        className={cn('flex h-8 items-center gap-2', className)}
        {...restProps}>
        {logo}
        <CopyID value={id} size="compact" width="auto" />
      </div>
    )
  }

  return (
    <BaseTableCell
      name={displayName}
      logo={logo}
      id={id}
      status={status}
      simple={simple}
      className={className}
      {...restProps}
    />
  )
}
