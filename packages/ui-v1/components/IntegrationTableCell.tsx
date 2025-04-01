'use client'

import {Core} from '@openint/api-v1/models'
import {cn} from '@openint/shadcn/lib/utils'
import {BaseTableCell} from './BaseTableCell'
import {CopyID} from './CopyID'
import {Icon} from './Icon'
import {StatusDot, StatusType} from './StatusDot'

interface IntegrationTableCellPropsObject
  extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Integration object
   */
  integration: Core['integration']
  /**
   * Status of the integration
   */
  status?: StatusType
  /**
   * Brand color for the logo background
   */
  brandColor?: string
  /**
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
   * Whether to use an app icon instead of initials
   */
  useIcon?: boolean
  /**
   * Optional className for styling
   */
  className?: string
}

interface IntegrationTableCellPropsProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * @deprecated Use integration.name instead
   * Name of the integration
   */
  name: string
  /**
   * @deprecated Use integration.id instead
   * ID of the integration
   */
  id?: string
  /**
   * Status of the integration
   */
  status?: StatusType
  /**
   * Brand color for the logo background
   */
  brandColor?: string
  /**
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
   * Whether to use an app icon instead of initials
   */
  useIcon?: boolean
  /**
   * Optional className for styling
   */
  className?: string
  /**
   * Integration object - used if provided instead of individual props
   */
  integration?: Core['integration']
}

export type IntegrationTableCellProps =
  | IntegrationTableCellPropsObject
  | IntegrationTableCellPropsProps

export function IntegrationTableCell(props: IntegrationTableCellProps) {
  // Determine if we're using the object-based or property-based API
  const usingObjectAPI =
    'integration' in props && props.integration !== undefined

  // Get values from the appropriate source
  const integration = usingObjectAPI ? props.integration : undefined

  // For object API, extract ID safely
  let integrationId = ''
  if (
    usingObjectAPI &&
    integration &&
    typeof integration === 'object' &&
    'id' in integration
  ) {
    integrationId = String(integration['id'])
  } else if (!usingObjectAPI && 'id' in props) {
    integrationId = String((props as IntegrationTableCellPropsProps).id || '')
  }

  // For object API, extract name safely
  let integrationName = ''
  if (
    usingObjectAPI &&
    integration &&
    typeof integration === 'object' &&
    'name' in integration
  ) {
    integrationName = String(integration['name'])
  } else if (!usingObjectAPI && 'name' in props) {
    integrationName = (props as IntegrationTableCellPropsProps).name
  }

  // If we still don't have a name, generate one from the ID
  if (!integrationName) {
    integrationName = integrationId
      ? `Integration ${integrationId.substring(0, 6)}`
      : 'Unknown Integration'
  }

  // Get other props
  const status = props.status || 'healthy'
  const simple = props.simple || false
  const compact = props.compact || false
  const useIcon = props.useIcon || false
  const className = props.className

  // Extract other props
  const {
    integration: _,
    name: __,
    id: ___,
    status: ____,
    brandColor: _____,
    textColor: ______,
    simple: _______,
    compact: ________,
    useIcon: _________,
    className: __________,
    ...restProps
  } = props as any

  const logoText = integrationName.substring(0, 2).toUpperCase()

  const logo = (
    <div
      className={cn(
        'bg-primary/15 relative flex items-center justify-center overflow-hidden rounded',
        compact ? 'h-8 w-8' : simple ? 'h-10 w-10' : 'h-[55px] w-[55px]',
      )}>
      {useIcon ? (
        <Icon
          name="AppWindow"
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
        {integrationId && (
          <CopyID value={integrationId} size="compact" width="auto" />
        )}
      </div>
    )
  }

  return (
    <BaseTableCell
      name={integrationName}
      logo={logo}
      id={integrationId ? `INTID_${integrationId}` : undefined}
      status={status}
      simple={simple}
      className={className}
      {...restProps}
    />
  )
}
