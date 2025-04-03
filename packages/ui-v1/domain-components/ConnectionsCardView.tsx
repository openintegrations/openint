'use client'

import {useMemo, useState} from 'react'
import {Core} from '@openint/api-v1/models'
import {cn} from '@openint/shadcn/lib/utils'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
  Separator,
} from '@openint/shadcn/ui'
import {CopyID} from '../components/CopyID'
import type {PropertyItem} from '../components/PropertyListView'
import {PropertyListView} from '../components/PropertyListView'
import type {StatusType} from '../components/StatusDot'
import {ConnectionTableCell} from './tables/ConnectionTableCell'

export interface ConnectionCardProps {
  connection: Core['connection']
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
  category = 'CRM',
  platform = 'Desktop',
  authMethod = 'oauth',
  version = 'V2',
}: ConnectionCardProps) {
  const customerId = connection.customer_id
  const connectorConfigId = connection.connector_config_id || ''

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
            width="100%"
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
            width="100%"
            size="compact"
            disableTooltip
            mountDelay={100}
          />
        ),
        isCopyID: true,
      })
    }

    return props
  }, [category, platform, authMethod, version, customerId, connectorConfigId])

  return (
    <>
      <div className="p-4">
        <ConnectionTableCell connection={connection} />
      </div>
      <Separator />
      <div className="p-4">
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

  const triggerElement = children || (
    <div className={cn('cursor-pointer', className)}>
      <ConnectionTableCell connection={connection} />
    </div>
  )

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{triggerElement}</PopoverTrigger>
      <PopoverContent className="w-[450px] p-0" align="start">
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
