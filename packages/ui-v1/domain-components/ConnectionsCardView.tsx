'use client'

import Image from 'next/image'
import {useMemo, useState} from 'react'
import {Core} from '@openint/api-v1/models'
import {cn} from '@openint/shadcn/lib/utils'
import {
  Badge,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Separator,
} from '@openint/shadcn/ui'
import {CopyID} from '../components/CopyID'
import type {PropertyItem} from '../components/PropertyListView'
import {PropertyListView} from '../components/PropertyListView'
import type {StatusType} from '../components/StatusDot'
import {getConnectorLogoUrl} from '../utils/images'
import {ConnectionTableCell} from './tables/ConnectionTableCell'

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

export function ConnectionCardContent({
  connection,
  status = 'offline',
  category,
  platform,
  authMethod,
  version,
}: ConnectionCardProps) {
  const customerId = connection.customer_id
  const connectorConfigId = connection.connector_config_id || ''

  // Try to extract values from connection if not provided as props
  const effectiveCategory = category || connection.connector_name || 'Unknown'
  // Default auth method based on connection settings
  const effectiveAuthMethod =
    authMethod ||
    (connection.settings?.oauth
      ? 'oauth'
      : connection.settings?.apikey
        ? 'apikey'
        : 'Unknown')
  // Use provided values or defaults
  const effectivePlatform = platform || 'Desktop'
  const effectiveVersion = version || 'V1'

  // Get connector details for enhanced display
  const connectorName = connection.connector_name || 'Unknown Connector'
  const displayName =
    connectorName.charAt(0).toUpperCase() + connectorName.slice(1)
  const logoUrl = getConnectorLogoUrl(connectorName)

  // Status badge configuration
  const getStatusInfo = (status: StatusType) => {
    switch (status) {
      case 'healthy':
        return {
          color: 'bg-green-50 text-green-700 border-green-200',
          label: 'Healthy',
        }
      case 'warning':
        return {
          color: 'bg-yellow-50 text-yellow-700 border-yellow-200',
          label: 'Warning',
        }
      case 'destructive':
        return {color: 'bg-red-50 text-red-700 border-red-200', label: 'Error'}
      case 'offline':
      default:
        return {
          color: 'bg-gray-50 text-gray-700 border-gray-200',
          label: 'Offline',
        }
    }
  }

  const statusInfo = getStatusInfo(status)

  const properties = useMemo(() => {
    const props: PropertyItem[] = [
      {title: 'Category', value: effectiveCategory},
      {title: 'Platform', value: effectivePlatform},
      {title: 'Auth Method', value: effectiveAuthMethod},
      {title: 'Version', value: effectiveVersion},
    ]

    if (customerId) {
      props.push({
        title: 'CustomerID',
        value: (
          <CopyID
            value={customerId}
            width="100%"
            size="compact"
            disableTooltip
            mountDelay={100}
            className="bg-gray-50 transition-colors hover:bg-gray-100"
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
            width="100%"
            size="compact"
            disableTooltip
            mountDelay={100}
            className="bg-gray-50 transition-colors hover:bg-gray-100"
          />
        ),
        isCopyID: true,
      })
    }

    return props
  }, [
    effectiveCategory,
    effectivePlatform,
    effectiveAuthMethod,
    effectiveVersion,
    customerId,
    connectorConfigId,
  ])

  return (
    <div className="overflow-hidden rounded-lg">
      {/* Enhanced header with logo, name and status */}
      <div className="flex items-center gap-3 bg-gradient-to-r from-gray-50 to-white p-5">
        <div className="relative flex h-12 w-12 flex-shrink-0 items-center justify-center overflow-hidden rounded-md bg-white shadow-sm ring-1 ring-gray-100">
          <Image
            src={logoUrl}
            alt={`${displayName} logo`}
            width={48}
            height={48}
            className="object-contain p-1"
            onError={(e) => {
              // If logo fails to load, show initials instead
              e.currentTarget.style.display = 'none'
              e.currentTarget.parentElement!.innerHTML = `<span class="text-primary font-medium text-base">${displayName.substring(0, 2).toUpperCase()}</span>`
            }}
          />
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-medium text-gray-900">{displayName}</h3>
            <Badge
              variant="outline"
              className={cn('border text-xs font-medium', statusInfo.color)}>
              {statusInfo.label}
            </Badge>
          </div>
          <div className="text-sm text-gray-500">
            {effectivePlatform} · {effectiveAuthMethod} · v{effectiveVersion}
          </div>
        </div>
      </div>
      <Separator />
      <div className="grid grid-cols-1 gap-4 p-5">
        <div>
          <div className="mb-1 text-xs font-medium uppercase text-gray-500">
            Category
          </div>
          <div className="text-sm font-medium text-gray-700">
            {effectiveCategory}
          </div>
        </div>
        {customerId && (
          <div>
            <div className="mb-1 text-xs font-medium uppercase text-gray-500">
              Customer ID
            </div>
            <CopyID
              value={customerId}
              width="100%"
              size="compact"
              className="bg-gray-50 transition-colors hover:bg-gray-100"
            />
          </div>
        )}
        {connectorConfigId && (
          <div>
            <div className="mb-1 text-xs font-medium uppercase text-gray-500">
              Connector Config ID
            </div>
            <CopyID
              value={connectorConfigId}
              width="100%"
              size="compact"
              className="bg-gray-50 transition-colors hover:bg-gray-100"
            />
          </div>
        )}
      </div>
    </div>
  )
}

export function ConnectionsCardView({
  connection,
  status = 'offline',
  category,
  platform,
  authMethod,
  version,
  children,
  className,
}: ConnectionCardProps) {
  const [open, setOpen] = useState(false)

  // Create a nicer trigger element with the connector logo
  const connectorName = connection.connector_name || 'Unknown Connector'
  const logoUrl = getConnectorLogoUrl(connectorName)
  const displayName =
    connectorName.charAt(0).toUpperCase() + connectorName.slice(1)

  const customTrigger = (
    <div className={cn('group cursor-pointer', className)}>
      <div className="flex items-center gap-2">
        <div className="group-hover:ring-primary/20 flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-md bg-white shadow-sm ring-1 ring-gray-100 transition-all group-hover:ring-2">
          <Image
            src={logoUrl}
            alt={`${displayName} logo`}
            width={40}
            height={40}
            className="object-contain p-1"
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

  const triggerElement = children || customTrigger

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{triggerElement}</PopoverTrigger>
      <PopoverContent
        className="w-[450px] p-0 shadow-lg"
        align="start"
        sideOffset={5}>
        <ConnectionCardContent
          connection={connection}
          status={status}
          category={category}
          platform={platform}
          authMethod={authMethod}
          version={version}
        />
      </PopoverContent>
    </Popover>
  )
}

ConnectionsCardView.Content = ConnectionCardContent
