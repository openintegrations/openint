'use client'

import {useSuspenseQuery} from '@tanstack/react-query'
import React from 'react'
import {useTRPC} from '@/lib-client/TRPCApp'

// MARK: -

export function AddConnection(props: {initialData: Promise<any>}) {
  const initialData = React.use(props.initialData)

  // Simulate a random delay between 0-2 seconds
  // await new Promise((resolve) => setTimeout(resolve, Math.random() * 2000))

  // const [connectorConfigs] = trpc.listConnectorConfigs.useSuspenseQuery()

  const trpc = useTRPC() // use `import { trpc } from './utils/trpc'` if you're using the singleton pattern
  const res = useSuspenseQuery(
    trpc.listConnectorConfigs.queryOptions(
      {},
      (initialData ? {initialData} : undefined) as never,
    ),
  )

  const connectorConfigs = res.data.items

  return (
    <ul>
      {res.isFetching && <em>Loading...</em>}
      {connectorConfigs.map((ccfg) => (
        <li key={ccfg.id} className="ml-4 list-disc">
          <p>{ccfg.id}</p>
        </li>
      ))}
      <button
        onClick={() => res.refetch()}
        className="mt-4 rounded bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600"
        disabled={res.isFetching}>
        {res.isFetching ? 'Refreshing...' : 'Refresh Connectors'}
      </button>
    </ul>
  )
}

export function ConnectionList(props: {initialData?: Promise<any>}) {
  const initialData = React.use(props.initialData ?? Promise.resolve(undefined))

  // Simulate a random delay between 0-2 seconds
  // await new Promise((resolve) => setTimeout(resolve, Math.random() * 2000))

  // const [connections] = trpc.listConnections.useSuspenseQuery()

  const trpc = useTRPC() // use `import { trpc } from './utils/trpc'` if you're using the singleton pattern
  const res = useSuspenseQuery(
    trpc.listConnections.queryOptions(
      {},
      (initialData ? {initialData} : undefined) as never,
    ),
  )

  const connections = res.data.items

  return (
    <ul>
      {res.isFetching && <em>Loading...</em>}
      {connections.map((conn) => (
        <li key={conn.id} className="ml-4 list-disc">
          <p>{conn.id}</p>
        </li>
      ))}
      <button
        onClick={() => res.refetch()}
        className="mt-4 rounded bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600"
        disabled={res.isFetching}>
        {res.isFetching ? 'Refreshing...' : 'Refresh Connections'}
      </button>
    </ul>
  )
}
