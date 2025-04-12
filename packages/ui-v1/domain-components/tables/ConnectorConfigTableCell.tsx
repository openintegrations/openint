'use client'

import type {Core} from '@openint/api-v1/models'
import type {StatusType} from '../../components/StatusDot'

import {cn} from '@openint/shadcn/lib/utils'
import {BaseTableCell} from '../../components/BaseTableCell'
import {CopyID} from '../../components/CopyID'
import {StatusDot} from '../../components/StatusDot'

interface ConnectorConfigTableCellProps
  extends React.HTMLAttributes<HTMLDivElement> {
  connectorConfig: Core['connector_config_select']
  simple?: boolean
  compact?: boolean
  status?: StatusType
  className?: string
}

export function ConnectorConfigTableCell(props: ConnectorConfigTableCellProps) {
  const {connectorConfig} = props
  const status = props.status || 'healthy'
  const simple = props.simple || false
  const compact = props.compact || false
  const className = props.className

  // Extract other props for rest spread
  const {
    connectorConfig: _,
    status: __,
    simple: ___,
    compact: ____,
    className: _____,
    ...restProps
  } = props

  // Generate display name from connector config
  const displayName =
    connectorConfig.display_name ||
    connectorConfig.connector_name ||
    `Config ${connectorConfig.id ? connectorConfig.id.substring(0, 6) : 'Unknown'}`

  const logoText = displayName.substring(0, 2).toUpperCase()

  // NOTE: this should take the logo from the _assets folder, who's file name has the connector_name from the connectorConfig object
  const logo = (
    <div
      className={cn(
        'bg-primary/15 relative flex h-[55px] w-[55px] items-center justify-center overflow-hidden rounded-sm',
        compact && 'h-8 w-8',
        simple && 'h-10 w-10',
      )}>
      <span
        className={cn(
          'text-primary font-medium',
          compact ? 'text-xs' : simple ? 'text-xs' : 'text-base',
        )}>
        {logoText}
      </span>
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
        {connectorConfig.id && (
          <CopyID value={connectorConfig.id} size="compact" width="auto" />
        )}
      </div>
    )
  }

  return (
    <BaseTableCell
      name={displayName}
      logo={logo}
      id={connectorConfig.id ? `CCFGID_${connectorConfig.id}` : undefined}
      status={status}
      simple={simple}
      className={className}
      {...restProps}
    />
  )
}
