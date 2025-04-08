'use client'

import Image from 'next/image'
import {useMemo, useState} from 'react'
import {Core} from '@openint/api-v1/models'
import {cn} from '@openint/shadcn/lib/utils'
import {Separator} from '@openint/shadcn/ui'
import {CopyID} from '../components/CopyID'
import type {PropertyItem} from '../components/PropertyListView'
import {PropertyListView} from '../components/PropertyListView'
import type {StatusType} from '../components/StatusDot'
import {getConnectorLogoUrl} from '../utils/images'

export interface ConnectionCardProps {
  connection: Core['connection_select']
  status: StatusType
  category?: string
  platform?: string
  authMethod?: string
  version?: string
  children?: React.ReactNode
  className?: string
}

// Helper function to smartly truncate connector config IDs
// Format: ccfg_service_id -> ccfg_service_id...
const truncateConnectorConfigId = (id: string): string => {
  if (!id) return ''

  // Find the position of the second underscore
  const firstUnderscore = id.indexOf('_')
  if (firstUnderscore === -1) return id

  const secondUnderscore = id.indexOf('_', firstUnderscore + 1)
  if (secondUnderscore === -1) return id

  // Take everything up to 3 characters after the second underscore, then add ellipsis
  const truncatePoint = secondUnderscore + 4
  if (id.length <= truncatePoint) return id

  return `${id.substring(0, truncatePoint)}...`
}

export function ConnectionCardContent({
  connection,
  category = 'CRM',
  platform = 'Desktop',
  authMethod = 'oauth',
  version = 'V2',
}: ConnectionCardProps) {
  const customerId = connection.customer_id
  const connectorConfigId = connection.connector_config_id || ''

  // Create truncated versions of the IDs for display
  const truncatedCustomerId = customerId
    ? customerId.length > 8
      ? `${customerId.substring(0, 8)}...`
      : customerId
    : ''
  const truncatedConnectorConfigId =
    truncateConnectorConfigId(connectorConfigId)

  const properties = useMemo(() => {
    const props: PropertyItem[] = [
      {title: 'Category', value: category},
      {title: 'Platform', value: platform},
      {title: 'Auth Method', value: authMethod},
      {title: 'Version', value: version},
    ]

    if (customerId) {
      props.push({
        title: 'CustomerID',
        value: (
          <CopyID
            value={customerId}
            truncatedDisplay={truncatedCustomerId}
            width="auto"
            size="compact"
            disableTooltip
            mountDelay={100}
          />
        ),
        isCopyID: true,
      })
    }

    if (connectorConfigId) {
      props.push({
        title: 'ConnectorConfigID',
        value: (
          <CopyID
            value={connectorConfigId}
            truncatedDisplay={truncatedConnectorConfigId}
            width="auto"
            size="compact"
            disableTooltip
            mountDelay={100}
          />
        ),
        isCopyID: true,
      })
    }

    return props
  }, [
    category,
    platform,
    authMethod,
    version,
    customerId,
    connectorConfigId,
    truncatedCustomerId,
    truncatedConnectorConfigId,
  ])

  // Format connector name for display and get logo URL
  const connectorName = connection.connector_name || 'Unknown Connector'
  const displayName =
    connectorName.charAt(0).toUpperCase() + connectorName.slice(1)
  const logoUrl = getConnectorLogoUrl(connectorName)

  return (
    <>
      <div className="flex items-center gap-3 p-4">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-sm bg-gray-50">
          <Image
            src={logoUrl}
            alt={`${displayName} logo`}
            width={40}
            height={40}
            className="object-contain"
            onError={(e) => {
              // If logo fails to load, show initials instead
              e.currentTarget.style.display = 'none'
              e.currentTarget.parentElement!.innerHTML = `<span class="text-primary font-medium text-base">${displayName.substring(0, 2).toUpperCase()}</span>`
            }}
          />
        </div>
        <div className="text-base font-medium">{displayName}</div>
      </div>
      <Separator />
      <div className="overflow-visible p-4">
        <PropertyListView properties={properties} />
      </div>
    </>
  )
}

export function ConnectionsCardView({
  connection,
  status,
  category = 'CRM',
  platform = 'Desktop',
  authMethod = 'oauth',
  version = 'V2',
  children,
  className,
}: ConnectionCardProps) {
  const [open, setOpen] = useState(false)
  const [coords, setCoords] = useState({x: 0, y: 0})

  const handleMouseEnter = (e: React.MouseEvent) => {
    setOpen(true)
    setCoords({x: e.clientX, y: e.clientY})
  }

  const handleMouseLeave = () => {
    setOpen(false)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (open) {
      setCoords({x: e.clientX, y: e.clientY})
    }
  }

  // Create a simplified connector display element
  const connectorName = connection.connector_name || 'Unknown Connector'
  const displayName =
    connectorName.charAt(0).toUpperCase() + connectorName.slice(1)
  const logoUrl = getConnectorLogoUrl(connectorName)

  const triggerElement = children || (
    <div
      className={cn('cursor-pointer', className)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}>
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center overflow-hidden rounded-sm bg-gray-50">
          <Image
            src={logoUrl}
            alt={`${displayName} logo`}
            width={32}
            height={32}
            className="object-contain"
            onError={(e) => {
              // If logo fails to load, show initials instead
              e.currentTarget.style.display = 'none'
              e.currentTarget.parentElement!.innerHTML = `<span class="text-primary text-xs font-medium">${displayName.substring(0, 2).toUpperCase()}</span>`
            }}
          />
        </div>
      </div>
    </div>
  )

  return (
    <>
      {triggerElement}
      {open && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            pointerEvents: 'none',
            width: '100vw',
            height: '100vh',
            zIndex: 50,
          }}>
          <div
            style={{
              position: 'absolute',
              left: `${coords.x}px`,
              top: `${coords.y}px`,
              transform: 'translate(10px, -50%)',
              pointerEvents: 'auto',
            }}>
            <div className="bg-popover w-[480px] overflow-visible rounded-md border p-0 shadow-md">
              <ConnectionCardContent
                connection={connection}
                status={status}
                category={category}
                platform={platform}
                authMethod={authMethod}
                version={version}
              />
            </div>
          </div>
        </div>
      )}
    </>
  )
}

ConnectionsCardView.Content = ConnectionCardContent
