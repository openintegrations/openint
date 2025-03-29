import React, {useEffect, useState} from 'react'
import {cn} from '@openint/shadcn/lib/utils'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
  Separator,
} from '@openint/shadcn/ui'
import {ConnectionTableCell} from '../components/ConnectionTableCell'
import {CopyID} from '../components/CopyID'
import {Icon} from '../components/Icon'
import {PropertyItem, PropertyListView} from '../components/PropertyListView'
import {StatusType} from '../components/StatusDot'

// Create a wrapper component for CopyID to prevent tooltip from showing prematurely
function SafeCopyID(props: React.ComponentProps<typeof CopyID>) {
  // Use a delay before rendering the component to prevent tooltip issues
  const [mounted, setMounted] = useState(false)
  const [copied, setCopied] = useState(false)
  const [showTooltip, setShowTooltip] = useState(false)

  useEffect(() => {
    // Small delay to ensure Popover is fully rendered before CopyID tooltips can trigger
    const timer = setTimeout(() => {
      setMounted(true)
    }, 100)

    return () => clearTimeout(timer)
  }, [])

  // Handle copy functionality for our custom implementation
  const handleCopy = () => {
    if (!mounted) return

    navigator.clipboard
      .writeText(props.value)
      .then(() => {
        setCopied(true)
        setShowTooltip(true)

        setTimeout(() => {
          setCopied(false)
          setShowTooltip(false)
        }, 2000)
      })
      .catch((err) => {
        console.error('Failed to copy text: ', err)
      })
  }

  // Only render placeholder during initial mount
  if (!mounted) {
    return (
      <div
        className={cn(
          'flex items-center gap-2 rounded border border-gray-200 bg-gray-50 text-xs text-gray-500',
          'px-2 py-1',
          props.className,
        )}
        style={{
          width:
            typeof props.width === 'number' ? `${props.width}px` : props.width,
        }}>
        <span className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap font-mono">
          {props.value}
        </span>
        <span className="flex-shrink-0 text-gray-400">
          <Icon name="Copy" size={14} />
        </span>
      </div>
    )
  }

  // Handle tooltip manually to prevent issues with the popover
  const getIconSize = () => {
    const size = props.size || 'medium'
    switch (size) {
      case 'compact':
        return 14
      case 'medium':
        return 16
      default:
        return 18
    }
  }

  const getPadding = () => {
    const size = props.size || 'medium'
    switch (size) {
      case 'compact':
        return 'px-2 py-1'
      case 'medium':
        return 'px-2.5 py-1.5'
      default:
        return 'px-3 py-2'
    }
  }

  // Use our own implementation to have more control over tooltip behavior
  return (
    <div
      className={cn(
        'flex items-center gap-2 rounded border border-gray-200 bg-gray-50 text-xs text-gray-500',
        getPadding(),
        props.className,
      )}
      style={{
        width:
          typeof props.width === 'number' ? `${props.width}px` : props.width,
      }}>
      {props.label && <span className="text-gray-400">{props.label}</span>}
      <span className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap font-mono">
        {props.value}
      </span>
      <div className="relative">
        <button
          onClick={handleCopy}
          className="flex-shrink-0 text-gray-400 transition-colors hover:text-gray-600"
          aria-label="Copy to clipboard"
          onMouseEnter={() => !copied && setShowTooltip(true)}
          onMouseLeave={() => !copied && setShowTooltip(false)}>
          <Icon name={copied ? 'Check' : 'Copy'} size={getIconSize()} />
        </button>

        {/* Custom tooltip that's more reliable with popovers */}
        {showTooltip && (
          <div className="absolute bottom-full left-1/2 mb-1.5 -translate-x-1/2 transform">
            <div className="bg-primary rounded px-2 py-1 text-xs text-white shadow-sm">
              {copied ? 'Copied!' : 'Copy to clipboard'}
            </div>
            <div className="bg-primary absolute left-1/2 top-full -mt-[2px] h-2 w-2 -translate-x-1/2 rotate-45 transform"></div>
          </div>
        )}
      </div>
    </div>
  )
}

export interface ConnectionCardProps {
  /**
   * The connection name
   */
  name: string
  /**
   * The connection ID
   */
  id: string
  /**
   * The connection status
   */
  status: StatusType
  /**
   * Category of the connection (e.g. CRM, Storage)
   */
  category?: string
  /**
   * Platform of the connection (e.g. Desktop, Mobile)
   */
  platform?: string
  /**
   * Authentication method used (e.g. oauth, apikey)
   */
  authMethod?: string
  /**
   * Version of the API or connector
   */
  version?: string
  /**
   * Customer ID associated with this connection
   */
  customerId?: string
  /**
   * Connector config ID associated with this connection
   */
  connectorConfigId?: string
  /**
   * Background color for the connection logo
   */
  backgroundColor?: string
  /**
   * Text color for the connection logo
   */
  textColor?: string
  /**
   * Optional trigger element. If not provided, a ConnectionTableCell will be used.
   */
  children?: React.ReactNode
  /**
   * Optional className for styling
   */
  className?: string
}

// Component for the content inside the popover
export function ConnectionCardContent({
  name,
  id,
  status,
  category = 'CRM',
  platform = 'Desktop',
  authMethod = 'oauth',
  version = 'V2',
  customerId,
  connectorConfigId,
  backgroundColor = '#f1f5f9',
  textColor = '#666666',
}: ConnectionCardProps) {
  // Build the properties for the PropertyListView
  const properties = React.useMemo(() => {
    const props: PropertyItem[] = [
      {title: 'Category', value: category},
      {title: 'Platform', value: platform},
      {title: 'Auth Method', value: authMethod},
      {title: 'Version', value: version},
    ]

    // Add optional properties if they exist
    if (customerId) {
      props.push({
        title: 'CustomerID',
        value: <SafeCopyID value={customerId} width="100%" size="compact" />,
        isCopyID: true,
      })
    }

    if (connectorConfigId) {
      props.push({
        title: 'ConnectorConfigID',
        value: (
          <SafeCopyID value={connectorConfigId} width="100%" size="compact" />
        ),
        isCopyID: true,
      })
    }

    return props
  }, [category, platform, authMethod, version, customerId, connectorConfigId])

  return (
    <>
      <div className="p-4">
        <ConnectionTableCell
          name={name}
          id={id}
          status={status}
          backgroundColor={backgroundColor}
          textColor={textColor}
        />
      </div>
      <Separator />
      <div className="p-4">
        <PropertyListView properties={properties} />
      </div>
    </>
  )
}

export function ConnectionsCardView({
  name,
  id,
  status,
  category = 'CRM',
  platform = 'Desktop',
  authMethod = 'oauth',
  version = 'V2',
  customerId,
  connectorConfigId,
  backgroundColor = '#f1f5f9',
  textColor = '#666666',
  children,
  className,
}: ConnectionCardProps) {
  const [open, setOpen] = useState(false)

  // Default trigger is the ConnectionTableCell if no children are provided
  const triggerElement = children || (
    <div className={cn('cursor-pointer', className)}>
      <ConnectionTableCell
        name={name}
        id={id}
        status={status}
        backgroundColor={backgroundColor}
        textColor={textColor}
      />
    </div>
  )

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{triggerElement}</PopoverTrigger>
      <PopoverContent className="w-[450px] p-0" align="start">
        <ConnectionCardContent
          name={name}
          id={id}
          status={status}
          category={category}
          platform={platform}
          authMethod={authMethod}
          version={version}
          customerId={customerId}
          connectorConfigId={connectorConfigId}
          backgroundColor={backgroundColor}
          textColor={textColor}
        />
      </PopoverContent>
    </Popover>
  )
}

// Attach the ConnectionCardContent to ConnectionsCardView for easier import
ConnectionsCardView.Content = ConnectionCardContent
