'use client'

import Image from 'next/image'
import {useQuery, useTRPC} from '@/lib-client/TRPCApp'

export default function IntegrationPage() {
  const trpc = useTRPC()

  const res = useQuery(
    trpc.listConnectorIntegrations.queryOptions({name: 'plaid'}),
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
