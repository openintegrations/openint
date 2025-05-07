'use client'

import Image from 'next/image'
import React from 'react'
import {useDebounce} from 'use-debounce'
import {VERTICAL_BY_KEY} from '@openint/cdk'
import {cn} from '@openint/shadcn/lib/utils'
import {Card, CardContent, Input} from '@openint/shadcn/ui'
import {useStateFromSearchParams} from '@openint/ui-v1'
import {useQuery, useTRPC} from '@/lib-client/TRPCApp'

interface VerticalFilterProps {
  selected: string | null
  onSelect: (key: string | null) => void
}

function VerticalFilter({selected, onSelect}: VerticalFilterProps) {
  return (
    <nav className="flex flex-col gap-1">
      <button
        className={cn(
          'hover:bg-muted rounded-md px-3 py-2 text-left transition',
          !selected && 'bg-muted font-semibold',
        )}
        onClick={() => onSelect(null)}>
        All Verticals
      </button>
      {Object.values(VERTICAL_BY_KEY).map((vertical) => (
        <button
          key={vertical.key}
          className={cn(
            'hover:bg-muted rounded-md px-3 py-2 text-left transition',
            selected === vertical.key && 'bg-muted font-semibold',
          )}
          onClick={() => onSelect(vertical.key)}>
          {vertical.name}
        </button>
      ))}
    </nav>
  )
}

function IntegrationList({
  searchText,
  verticalKey,
}: {
  searchText: string
  verticalKey: string | null
}) {
  const trpc = useTRPC()
  // TODO: Pass verticalKey to query if supported by backend
  const res = useQuery(
    trpc.listConnectorIntegrations.queryOptions({
      name: 'plaid', // TODO: Replace with dynamic connector if needed
      search_text: searchText || undefined,
    }),
  )

  if (res.status === 'pending') {
    return <div>Loading...</div>
  }
  if (res.status === 'error') {
    return <div>Error: {res.error.message}</div>
  }

  // TODO: Filter by verticalKey if integration data supports it
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
      {res.data.items.map((item) => (
        <Card key={item.id} className="flex flex-col items-center p-4">
          {item.logo_url && (
            <Image
              src={item.logo_url}
              alt={item.name}
              width={48}
              height={48}
              className="mb-2 rounded"
            />
          )}
          <CardContent className="p-0 text-center">
            <div className="text-sm font-medium">{item.name}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default function IntegrationPage() {
  const [searchText, setSearchText] = useStateFromSearchParams('q', {
    shallow: true,
    defaultValue: '' as string,
  })
  const [searchTextDebounced] = useDebounce(searchText ?? '', 1000)
  const [selectedVertical, setSelectedVertical] = React.useState<string | null>(
    null,
  )

  return (
    <div className="flex gap-8">
      <aside className="w-64 shrink-0 border-r py-6 pr-4">
        <h2 className="mb-4 text-lg font-semibold">Verticals</h2>
        <VerticalFilter
          selected={selectedVertical}
          onSelect={setSelectedVertical}
        />
      </aside>
      <main className="flex-1 py-6">
        <div className="mb-4 flex items-center gap-4">
          <Input
            type="search"
            placeholder="Search integrations..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="max-w-xs"
          />
        </div>
        <IntegrationList
          searchText={searchTextDebounced}
          verticalKey={selectedVertical}
        />
      </main>
    </div>
  )
}
