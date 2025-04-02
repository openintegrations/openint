'use client'

import {Core} from '@openint/api-v1/models'
import {cn} from '@openint/shadcn/lib/utils'
import {BaseTableCell} from './BaseTableCell'
import {CopyID} from './CopyID'
import {Icon} from './Icon'

interface IntegrationTableCellProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Integration object
   */
  integration: Core['integration']
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

export function IntegrationTableCell(props: IntegrationTableCellProps) {
  const {integration} = props
  const simple = props.simple || false
  const compact = props.compact || false
  const useIcon = props.useIcon || false
  const className = props.className

  // Extract other props
  const {
    integration: _,
    simple: __,
    compact: ___,
    useIcon: ____,
    className: _____,
    ...restProps
  } = props

  // Generate integration name - try to use the name from the object or generate from ID
  const integrationName =
    integration &&
    'name' in integration &&
    typeof integration['name'] === 'string'
      ? integration['name']
      : integration &&
          'id' in integration &&
          typeof integration['id'] === 'string'
        ? `Integration ${integration['id'].substring(0, 6)}`
        : 'Unknown Integration'

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
    </div>
  )

  if (compact) {
    return (
      <div className={cn('flex items-center gap-2', className)} {...restProps}>
        {logo}
        {integration &&
          'id' in integration &&
          typeof integration['id'] === 'string' && (
            <CopyID value={integration['id']} size="compact" width="auto" />
          )}
      </div>
    )
  }

  return (
    <BaseTableCell
      name={integrationName}
      logo={logo}
      id={
        integration &&
        'id' in integration &&
        typeof integration['id'] === 'string'
          ? `INTID_${integration['id']}`
          : undefined
      }
      simple={simple}
      className={className}
      {...restProps}
    />
  )
}
