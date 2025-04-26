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
  const [isFocused, setIsFocused] = useState(false)

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
        className={cn(
          'flex h-[85vh] max-h-[600px] max-w-2xl flex-col gap-0 overflow-hidden p-0 shadow-xl',
          className,
        )}
        onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader className="bg-foreground/5 flex-shrink-0 border-b px-6 py-4">
          <DialogTitle className="text-md">{title}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-1 flex-col overflow-hidden">
          <div
            className={cn(
              'bg-background sticky top-0 z-10 flex-shrink-0 transition-all duration-200',
              'border-b border-b-transparent',
              // Apply subtle shadow and border only when content is scrolled
              isFocused ? 'border-b-gray-100 shadow-sm' : '',
            )}>
            <div className="p-6 pb-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-500" />
                <Input
                  placeholder="Search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="border-gray-200 bg-gray-50/50 pl-10 transition-all duration-200 focus:bg-white focus:shadow-sm"
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                />
              </div>
            </div>
          </div>

          <div
            className="relative flex-1 overflow-y-auto"
            onScroll={(e) => {
              // When scrolling, set focus to create the separation effect
              if (e.currentTarget.scrollTop > 5) {
                setIsFocused(true)
              } else {
                setIsFocused(false)
              }
            }}>
            {/* Mobile view: Row mode with scrolling */}
            <div className="p-6 pt-3 md:hidden">
              {filteredConnectors.map((connector, index) => (
                <div
                  key={`${connector.name}-${connector.display_name || index}`}>
                  <div
                    className="rounded-md py-2 transition-all duration-100 hover:bg-gray-50"
                    onClick={() => onSelectConnector?.(connector)}>
                    <ConnectorCard
                      connector={connector}
                      mode="row"
                      displayBadges={false}
                      onCtaClick={() => onSelectConnector?.(connector)}
                      className="hover:bg-transparent"
                    />
                  </div>
                  {index < filteredConnectors.length - 1 && (
                    <div className="my-1 h-px bg-gray-100" />
                  )}
                </div>
              ))}
            </div>

            {/* Desktop view: Card grid */}
            <div className="hidden p-6 pt-3 md:grid md:grid-cols-2 md:gap-4">
              {filteredConnectors.map((connector, index) => (
                <div
                  key={`${connector.name}-${connector.display_name || index}`}
                  onClick={() => onSelectConnector?.(connector)}
                  className="transition-transform duration-100 hover:scale-[1.01]">
                  <ConnectorCard
                    connector={connector}
                    displayBadges={false}
                    onCtaClick={() => onSelectConnector?.(connector)}
                  />
                </div>
              ))}
            </div>

            {filteredConnectors.length === 0 && (
              <div className="col-span-2 py-16 text-center text-gray-500">
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
