import type {HTMLAttributes} from 'react'
import type {Core} from '@openint/api-v1/models'

import * as React from 'react'
import {cn} from '@openint/shadcn/lib/utils'
import {Input} from '@openint/shadcn/ui'
import {ConnectorCard} from './ConnectorCard'

export interface AddConnectorConfigProps
  extends HTMLAttributes<HTMLDivElement> {
  connectors: Array<Core['connector']>
  onSelectConnector?: (connector: Core['connector']) => void
  initialSearchQuery?: string
  variant?: 'default' | 'modal'
}

/**
 * AddConnectorConfig component displays a list of connector configurations with search functionality.
 * It can be used directly on a page or as a modal dialog.
 *
 * @param variant - 'default' for page view, 'modal' for modal/sheet view with shadow and rounded corners
 */
export const AddConnectorConfig = ({
  className,
  connectors,
  onSelectConnector,
  initialSearchQuery,
  variant = 'default',
  ...props
}: AddConnectorConfigProps) => {
  const [searchQuery, setSearchQuery] = React.useState(initialSearchQuery ?? '')

  const filteredConnectors = connectors.filter(
    (connector) =>
      connector.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (connector.display_name &&
        connector.display_name
          .toLowerCase()
          .includes(searchQuery.toLowerCase())),
  )

  return (
    <div className={cn('flex size-full flex-col', className)} {...props}>
      {/* Search bar */}
      <div className={cn('py-1 pl-6 pr-10')}>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 transform text-gray-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </span>
          <Input
            type="text"
            placeholder="Search connectors..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
            }}
            className="w-full pl-10"
          />
        </div>
      </div>

      {/* Connector list */}
      <div className={cn('min-h-0 flex-1 overflow-y-auto p-6')}>
        <div className={cn('grid grid-cols-1 gap-4 2xl:grid-cols-2')}>
          {filteredConnectors.map((connector, index) => (
            <ConnectorCard
              connector={connector}
              key={`${connector.name}-${index}`}
              onClick={() => {
                onSelectConnector && onSelectConnector(connector)
              }}
            />
          ))}
          {filteredConnectors.length === 0 && (
            <div className="col-span-2 py-8 text-center text-gray-500">
              No connectors found matching &quot;{searchQuery}&quot;
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
