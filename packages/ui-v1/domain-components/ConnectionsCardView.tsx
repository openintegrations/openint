'use client'

import type {ConnectionExpanded} from '@openint/api-v1/trpc/routers/connection.models'
import type {PropertyItem} from '../components/PropertyListView'
import type {StatusType} from '../components/StatusDot'

import Image from 'next/image'
import {useMemo, useState} from 'react'
import {cn} from '@openint/shadcn/lib/utils'
import {
  Badge,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Separator,
} from '@openint/shadcn/ui'
import {CopyID} from '../components/CopyID'
import {PropertyListView} from '../components/PropertyListView'
import {getConnectorLogoUrl} from '../utils/images'

export interface ConnectionCardProps {
  connection: ConnectionExpanded
  children?: React.ReactNode
  className?: string
}

export function ConnectionCardContent({connection}: ConnectionCardProps) {
  const customerId = connection.customer_id
  const connectorConfigId = connection.connector_config_id || ''

  const effectiveCategory = connection.connector_name || 'Unknown'

  const connectorName = connection.connector_name || 'Unknown Connector'
  const displayName =
    connectorName.charAt(0).toUpperCase() + connectorName.slice(1)
  const logoUrl = getConnectorLogoUrl(connectorName)

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

  const status = (connection.status || 'offline') as StatusType
  const statusInfo = getStatusInfo(status)

  const properties = useMemo(() => {
    const props: PropertyItem[] = [
      {title: 'Category', value: effectiveCategory},
    ]

    if (customerId) {
      props.push({
        title: 'Customer ID',
        value: (
          <CopyID
            value={customerId}
            width="100%"
            size="compact"
            className="bg-gray-50 transition-colors hover:bg-gray-100"
          />
        ),
        isCopyID: true,
      })
    }

    if (connectorConfigId) {
      props.push({
        title: 'Connector Config ID',
        value: (
          <CopyID
            value={connectorConfigId}
            width="100%"
            size="compact"
            className="bg-gray-50 transition-colors hover:bg-gray-100"
          />
        ),
        isCopyID: true,
      })
    }

    return props
  }, [effectiveCategory, customerId, connectorConfigId])

  return (
    <div className="overflow-hidden rounded-lg">
      <div className="flex items-center gap-3 bg-gradient-to-r from-gray-50 to-white p-5">
        <div className="relative flex h-12 w-12 flex-shrink-0 items-center justify-center overflow-hidden rounded-md bg-white shadow-sm ring-1 ring-gray-100">
          <Image
            src={logoUrl}
            alt={`${displayName} logo`}
            width={48}
            height={48}
            className="object-contain p-1"
            onError={(e) => {
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
          {/* TODO: Add platform and version */}
          {/* <div className="text-sm text-gray-500">
            {effectivePlatform} · {effectiveAuthMethod} · v{effectiveVersion}
          </div> */}
        </div>
      </div>
      <Separator />
      <div className="p-5">
        <PropertyListView properties={properties} modern={true} />
      </div>
    </div>
  )
}

export function ConnectionsCardView({
  connection,
  children,
  className,
}: ConnectionCardProps) {
  const [open, setOpen] = useState(false)

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
        <ConnectionCardContent connection={connection} />
      </PopoverContent>
    </Popover>
  )
}

ConnectionsCardView.Content = ConnectionCardContent
