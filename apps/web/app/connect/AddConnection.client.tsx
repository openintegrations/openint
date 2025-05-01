'use client'

import type {ConnectorConfig} from '@openint/api-v1/trpc/routers/connectorConfig.models'
import type {Id} from '@openint/cdk'

import {Search} from 'lucide-react'
import {useRouter} from 'next/navigation'
import {ReactElement, useState} from 'react'
import {type ConnectorName} from '@openint/api-v1/trpc/routers/connector.models'
import {cn} from '@openint/shadcn/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Input,
} from '@openint/shadcn/ui'
import {ConnectorDisplay} from '@openint/ui-v1/domain-components/ConnectorDisplay'
import {useMutableSearchParams} from '@openint/ui-v1/hooks/useStateFromSearchParam'
import {resolveLinkPath} from '@/lib-common/Link'
import {ConnectorConnectContainer} from './ConnectorConnect.client'

export type ConnectorConfigForCustomer = Pick<
  ConnectorConfig<'connector'>,
  'id' | 'connector_name' | 'connector'
>

export type AddConnectionPrefetchedCard = {
  connectorName: ConnectorName
  card: ReactElement
}

export function AddConnectionClient({
  cards,
  className,
}: {
  cards: AddConnectionPrefetchedCard[]
  className?: string
}) {
  const [isOpen] = useState(true)
  const [_, setSearchParams] = useMutableSearchParams()

  const onClose = () => {
    setSearchParams({view: 'manage'}, {shallow: false})
  }
  const [searchQuery, setSearchQuery] = useState('')
  const [isFocused, setIsFocused] = useState(false)

  const filteredCards = cards.filter((card) => {
    const searchLower = searchQuery.toLowerCase()
    return card.connectorName.toLowerCase().includes(searchLower)
  })

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className={cn(
          'flex h-[85vh] max-h-[600px] max-w-2xl flex-col gap-0 overflow-hidden p-0 shadow-xl',
          className,
        )}>
        <DialogHeader className="bg-foreground/5 flex-shrink-0 border-b px-6 py-4">
          <DialogTitle className="text-md">Add Integrations</DialogTitle>
        </DialogHeader>

        <div className="flex flex-1 flex-col overflow-hidden">
          <div
            className={cn(
              'bg-background sticky top-0 z-10 flex-shrink-0 transition-all duration-200',
              'border-b border-b-transparent',
              isFocused ? 'border-b-gray-100 shadow-sm' : '',
            )}>
            <div className="p-6 pb-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-500" />
                <Input
                  placeholder="Search integrations"
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
              const scrollTop = e.currentTarget.scrollTop
              const shouldBeFocused = scrollTop > 5
              if (shouldBeFocused !== isFocused) {
                setIsFocused(shouldBeFocused)
              }
            }}>
            {/* Mobile view */}
            <div className="p-6 pt-3 md:hidden">
              {filteredCards.map((card, index) => (
                <div key={`${card.connectorName}-${index}`}>
                  {card.card}
                  {index < filteredCards.length - 1 && (
                    <div className="my-1 h-px bg-gray-100" />
                  )}
                </div>
              ))}
            </div>

            {/* Desktop view: Grid layout */}
            <div className="hidden p-6 pt-3 md:grid md:grid-cols-2 md:gap-4">
              {filteredCards.map((card, index) => (
                <div
                  key={`${card.connectorName}-${index}`}
                  className="transition-transform duration-100 hover:scale-[1.01]">
                  {card.card}
                </div>
              ))}
            </div>

            {filteredCards.length === 0 && (
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

export function AddConnectionCard({
  connectorConfig,
}: {
  connectorConfig: ConnectorConfigForCustomer
  onReady?: (ctx: {state: string}, name: string) => void
}) {
  return (
    <ConnectorConnectContainer
      connectorName={connectorConfig.connector_name as ConnectorName}
      connector={connectorConfig.connector!}
      connectorConfigId={connectorConfig.id as Id['ccfg']}>
      {({isConnecting, handleConnect}) => (
        <>
          {/* NOTE/TODO: note sure how to remove duplication, 
           its there as we're using tailwind for consistent breakpoints with AddConnectionClient */}
          {/* Mobile view (visible below md breakpoint) */}
          <div className="md:hidden">
            <ConnectorDisplay
              connector={connectorConfig.connector!}
              className={cn(
                'transition-transform duration-100',
                !isConnecting && 'hover:scale-[1.01]',
                isConnecting && 'cursor-not-allowed opacity-70',
              )}
              displayBadges={false}
              mode="row"
              onPress={() => {
                if (isConnecting) {
                  return
                }
                handleConnect()
              }}
            />
          </div>

          {/* Desktop view (visible at md breakpoint and above) */}
          <div className="hidden md:block">
            <ConnectorDisplay
              connector={connectorConfig.connector!}
              className={cn(
                'transition-transform duration-100',
                !isConnecting && 'hover:scale-[1.01]',
                isConnecting && 'cursor-not-allowed opacity-70',
              )}
              displayBadges={false}
              mode="card"
              onPress={() => {
                if (isConnecting) {
                  return
                }
                handleConnect()
              }}
            />
          </div>
        </>
      )}
    </ConnectorConnectContainer>
  )
}
