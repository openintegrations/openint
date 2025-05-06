'use client'

import Image from 'next/image'
import {useDebounce} from 'use-debounce'
import {Input} from '@openint/shadcn/ui'
import {useStateFromSearchParams} from '@openint/ui-v1'
import {useQuery, useTRPC} from '@/lib-client/TRPCApp'

function IntegrationList({searchText}: {searchText: string}) {
  const trpc = useTRPC()

  const res = useQuery(
    trpc.listConnectorIntegrations.queryOptions({
      name: 'plaid',
      search_text: searchText || undefined,
    }),
  )

  if (res.status === 'pending') {
    return <div>Loading...</div>
  }
  if (res.status === 'error') {
    return <div>Error: {res.error.message}</div>
  }

  return (
    <div>
      {res.data.items.map((item) => (
        <div key={item.id}>
          <div>ID: {item.id}</div>
          <div>Name: {item.name}</div>
          {item.logo_url && (
            <Image
              src={item.logo_url}
              alt={item.name}
              width={100}
              height={100}
            />
          )}
        </div>
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

  return (
    <div className="space-y-4">
      <Input
        type="search"
        placeholder="Search integrations..."
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
      />
      <IntegrationList searchText={searchTextDebounced} />
    </div>
  )
}
