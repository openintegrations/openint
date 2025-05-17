'use client'

import Image from 'next/image'
import React from 'react'
import {useDebounce} from 'use-debounce'
import {VERTICAL_BY_KEY} from '@openint/cdk'
import {cn} from '@openint/shadcn/lib/utils'
import {Button, Card, CardContent, Checkbox, Input} from '@openint/shadcn/ui'
import {useStateFromSearchParams} from '@openint/ui-v1'
import {useQuery, useTRPC} from '@/lib-client/TRPCApp'

interface VerticalFilterProps {
  selected: string[]
  onSelect: (key: string) => void
  onDeselect: (key: string) => void
}

function VerticalFilter({selected, onSelect, onDeselect}: VerticalFilterProps) {
  const handleReset = () => {
    // This is a placeholder. The parent must pass a stable setSelectedVerticals or similar if you want to fully control from here.
    // In this codebase, we use search params, so this will be handled by the parent via props.
    // See IntegrationPage for the actual implementation.
    // TODO: Move the reset logic here if you want to fully control state from this component.
  }

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Verticals</h2>
        {selected.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground h-auto px-2 py-1 text-xs"
            onClick={handleReset}
            // TODO: Implement reset logic by lifting state or passing a callback from parent
          >
            Reset
          </Button>
        )}
      </div>
      <nav className="flex flex-col gap-1">
        {Object.values(VERTICAL_BY_KEY).map((vertical) => {
          const isChecked = selected.includes(vertical.key)
          return (
            <label
              key={vertical.key}
              className={cn(
                'hover:bg-muted flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 transition',
                isChecked && 'bg-muted font-semibold',
              )}>
              <Checkbox
                checked={isChecked}
                onCheckedChange={(checked) => {
                  if (checked) onSelect(vertical.key)
                  else onDeselect(vertical.key)
                }}
                aria-label={vertical.name}
              />
              <span className="text-left text-sm">{vertical.name}</span>
            </label>
          )
        })}
      </nav>
    </>
  )
}

function IntegrationList({
  searchText,
  verticalKeys,
}: {
  searchText: string
  verticalKeys: string[]
}) {
  const trpc = useTRPC()
  // TODO: Pass verticalKeys to query if supported by backend
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

  // TODO: Filter by verticalKeys if integration data supports it
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

  // Use comma-separated string in search params for verticals
  const [verticalsParam, setVerticalsParam] = useStateFromSearchParams(
    'verticals',
    {shallow: true, defaultValue: '' as string},
  )
  const selectedVerticals = React.useMemo<string[]>(
    () =>
      typeof verticalsParam === 'string' && verticalsParam.length > 0
        ? verticalsParam.split(',').filter(Boolean)
        : [],
    [verticalsParam],
  )

  const handleSelectVertical = (key: string) => {
    if (!selectedVerticals.includes(key)) {
      setVerticalsParam([...selectedVerticals, key].join(','))
    }
  }
  const handleDeselectVertical = (key: string) => {
    setVerticalsParam(selectedVerticals.filter((k) => k !== key).join(','))
  }

  return (
    <div className="flex gap-8">
      <aside className="w-64 shrink-0 border-r py-6 pr-4">
        <VerticalFilter
          selected={selectedVerticals}
          onSelect={handleSelectVertical}
          onDeselect={handleDeselectVertical}
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
        <div className="relative">
          <div className="max-h-[70vh] overflow-y-auto pr-2">
            <IntegrationList
              searchText={searchTextDebounced}
              verticalKeys={selectedVerticals}
            />
          </div>
        </div>
      </main>
    </div>
  )
}
