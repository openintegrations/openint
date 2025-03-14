import React, {useState} from 'react'
import type {Core} from '@openint/api-v1/models'
import {cn} from '@openint/shadcn/lib/utils'
import {Input, Separator} from '@openint/shadcn/ui'
import {ConnectorTemporary} from './__stories__/fixtures'
import {ConnectorCard} from './ConnectorCard'

export interface AddConnectorConfigProps
  extends React.HTMLAttributes<HTMLDivElement> {
  connectors: Core['connector'][]
  onClose?: () => void
  onSelectConnector?: (connector: Core['connector']) => void
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
  onClose,
  onSelectConnector,
  variant = 'default',
  ...props
}: AddConnectorConfigProps) => {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredConnectors = connectors.filter(
    (connector) =>
      connector.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (connector.display_name &&
        connector.display_name
          .toLowerCase()
          .includes(searchQuery.toLowerCase())),
  )

  return (
    <div
      className={cn(
        'flex w-full flex-col',
        variant === 'modal' && 'max-w-4xl rounded-lg bg-white shadow-lg',
        className,
      )}
      {...props}>
      {/* Header */}
      <div
        className={cn(
          'flex items-center justify-between p-6',
          variant === 'modal' && 'border-b',
        )}>
        <h2 className="text-2xl font-bold">Add Connector Config</h2>
        {/* Only show close button in modal variant */}
        {onClose && variant === 'modal' && (
          <button
            onClick={onClose}
            className="rounded-full p-2 hover:bg-gray-100"
            aria-label="Close">
            <span className="relative block h-5 w-5">
              <span className="absolute top-1/2 block h-0.5 w-5 -translate-y-1/2 rotate-45 transform bg-gray-600"></span>
              <span className="absolute top-1/2 block h-0.5 w-5 -translate-y-1/2 -rotate-45 transform bg-gray-600"></span>
            </span>
          </button>
        )}
      </div>

      {/* Search bar */}
      <div className={cn('p-6', variant === 'modal' && 'border-b')}>
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
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10"
          />
        </div>
      </div>

      {/* Divider - always show in default view, only show in modal if not already using border-b */}
      {variant === 'default' && <Separator className="w-full" />}

      {/* Connector list */}
      <div
        className={cn(
          'grid grid-cols-1 gap-4 p-6 md:grid-cols-2',
          variant === 'modal' && 'max-h-[60vh] overflow-y-auto',
        )}>
        {filteredConnectors.map((connector, index) => (
          <div
            key={`${connector.name}-${index}`}
            onClick={() => onSelectConnector && onSelectConnector(connector)}>
            {/* NOTE: casting to any and ConnectorTemporary is a temporary solution to avoid type 
            errors until we accept connector types from the server on ConnectorCard*/}
            <ConnectorCard connector={connector as any as ConnectorTemporary} />
          </div>
        ))}
        {filteredConnectors.length === 0 && (
          <div className="col-span-2 py-8 text-center text-gray-500">
            No connectors found matching &quot;{searchQuery}&quot;
          </div>
        )}
      </div>
    </div>
  )
}
