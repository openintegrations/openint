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
import {ConnectionTableCell} from '../components/ConnectionTableCell'
import {CopyID} from '../components/CopyID'
import type {PropertyItem} from '../components/PropertyListView'
import {PropertyListView} from '../components/PropertyListView'
import type {StatusType} from '../components/StatusDot'

export interface ConnectionCardProps {
  /**
   * Connection object containing all connection details
   */
  connection: Core['connection']
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
  connection,
  status,
  category = 'CRM',
  platform = 'Desktop',
  authMethod = 'oauth',
  version = 'V2',
}: ConnectionCardProps) {
  // Extract relevant data from connection
  const customerId = connection.customer_id
  const connectorConfigId = connection.connector_config_id || ''
  // This value is used in the ConnectionTableCell via connection object, so it doesn't need to be assigned to a variable

  // Build the properties for the PropertyListView
  const properties = useMemo(() => {
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
        <ConnectionTableCell connection={connection} status={status} />
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

  // Default trigger is the ConnectionTableCell if no children are provided
  const triggerElement = children || (
    <div className={cn('cursor-pointer', className)}>
      <ConnectionTableCell connection={connection} status={status} />
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

// Attach the ConnectionCardContent to ConnectionsCardView for easier import
ConnectionsCardView.Content = ConnectionCardContent
