'use client'

import type {Core} from '@openint/api-v1/models'

import {Search} from 'lucide-react'
import {useState} from 'react'
import {cn} from '@openint/shadcn/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Input,
} from '@openint/shadcn/ui'
import {ConnectorCard} from './ConnectorCard'

export interface LinkConnectorModalProps {
  isOpen: boolean
  onClose: () => void
  connectors: Array<Core['connector']>
  onSelectConnector?: (connector: Core['connector']) => void
  title?: string
  className?: string
  initialSearchValue?: string
}

export function LinkConnectorModal({
  isOpen,
  onClose,
  connectors = [],
  onSelectConnector,
  title = 'Select Integration',
  className,
  initialSearchValue = '',
}: LinkConnectorModalProps) {
  const [searchQuery, setSearchQuery] = useState(initialSearchValue)

  const filteredConnectors = connectors.filter((connector) => {
    const searchLower = searchQuery.toLowerCase()
    return (
      connector.name.toLowerCase().includes(searchLower) ||
      (connector.display_name &&
        connector.display_name.toLowerCase().includes(searchLower))
    )
  })

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className={cn('max-w-2xl gap-0 p-0', className)}
        onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader className="border-b px-6 py-4">
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="p-6">
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-500" />
            <Input
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {filteredConnectors.map((connector) => (
              <div
                key={connector.name}
                onClick={() => onSelectConnector?.(connector)}>
                <ConnectorCard
                  connector={connector}
                  ctaText="Connect"
                  displayBadges={false}
                  onCtaClick={() => onSelectConnector?.(connector)}
                />
              </div>
            ))}
            {filteredConnectors.length === 0 && (
              <div className="col-span-2 py-8 text-center text-gray-500">
                No integrations found matching{' '}
                {searchQuery ? `"${searchQuery}"` : 'your search'}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
