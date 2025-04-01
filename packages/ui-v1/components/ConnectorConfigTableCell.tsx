'use client'

import {Core} from '@openint/api-v1/models'
import {cn} from '@openint/shadcn/lib/utils'
import {BaseTableCell} from './BaseTableCell'
import {CopyID} from './CopyID'
import {StatusDot, StatusType} from './StatusDot'

interface ConnectorConfigTableCellPropsObject
  extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Connector config object
   */
  connectorConfig: Core['connector_config']
  /**
   * Whether to show the simple variant (logo and name only)
   */
  simple?: boolean
  /**
   * Whether to show the compact variant (just logo and ID, no name)
   */
  compact?: boolean
  /**
   * Status of the connector config (overrides automatic status detection)
   */
  status?: StatusType
  /**
   * @deprecated Use the default theme styling
   * Background color for the logo
   */
  backgroundColor?: string
  /**
   * @deprecated Use the default theme styling
   * Text color for the logo text
   */
  textColor?: string
  /**
   * Optional className for styling
   */
  className?: string
}

interface ConnectorConfigTableCellPropsProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * @deprecated Use connectorConfig.display_name or connectorConfig.connector_name instead
   * Name of the connector config
   */
  name: string
  /**
   * @deprecated Use connectorConfig.id instead
   * ID of the connector config
   */
  id?: string
  /**
   * Status of the connector config
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
   * Optional className for styling
   */
  className?: string
  /**
   * Connector config object - used if provided instead of individual props
   */
  connectorConfig?: Core['connector_config']
}

export type ConnectorConfigTableCellProps =
  | ConnectorConfigTableCellPropsObject
  | ConnectorConfigTableCellPropsProps

export function ConnectorConfigTableCell(props: ConnectorConfigTableCellProps) {
  // Determine if we're using the object-based or property-based API
  const usingObjectAPI =
    'connectorConfig' in props && props.connectorConfig !== undefined

  // Get values from the appropriate source
  const connectorConfig = usingObjectAPI ? props.connectorConfig : undefined

  // For object API, extract ID safely
  let configId = ''
  if (
    usingObjectAPI &&
    connectorConfig &&
    typeof connectorConfig === 'object' &&
    'id' in connectorConfig
  ) {
    configId = String(connectorConfig.id || '')
  } else if (!usingObjectAPI && 'id' in props) {
    configId = String((props as ConnectorConfigTableCellPropsProps).id || '')
  }

  // For object API, extract name safely
  let displayName = ''
  if (usingObjectAPI && connectorConfig) {
    displayName =
      connectorConfig.display_name ||
      connectorConfig.connector_name ||
      `Config ${configId ? configId.substring(0, 6) : 'Unknown'}`
  } else if (!usingObjectAPI && 'name' in props) {
    displayName = (props as ConnectorConfigTableCellPropsProps).name
  }

  // If we still don't have a name, generate one from the ID
  if (!displayName) {
    displayName = configId
      ? `Config ${configId.substring(0, 6)}`
      : 'Unknown Config'
  }

  // Extract other props
  const status = props.status || 'healthy'
  const simple = props.simple || false
  const compact = props.compact || false
  const className = props.className

  // Extract other props for rest spread
  const {
    connectorConfig: _,
    name: __,
    id: ___,
    status: ____,
    backgroundColor: _____,
    textColor: ______,
    simple: _______,
    compact: ________,
    className: _________,
    ...restProps
  } = props as any

  const logoText = displayName.substring(0, 2).toUpperCase()

  // NOTE: this should take the logo from the _assets folder, who's file name has the connector_name from the connectorConfig object
  const logo = (
    <div
      className={cn(
        'bg-primary/15 relative flex h-[55px] w-[55px] items-center justify-center overflow-hidden rounded',
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
        {configId && <CopyID value={configId} size="compact" width="auto" />}
      </div>
    )
  }

  return (
    <BaseTableCell
      name={displayName}
      logo={logo}
      id={configId ? `CCFGID_${configId}` : undefined}
      status={status}
      simple={simple}
      className={className}
      {...restProps}
    />
  )
}
