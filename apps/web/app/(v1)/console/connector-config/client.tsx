'use client'

import {use} from 'react'
import type {core} from '@openint/api-v1/models'
import {useSuspenseQuery} from '@openint/ui-v1/trpc'
import type {z} from '@openint/util'
import {useTRPC} from '../client'

export function ConnectorConfigList(props: {
  initialData?: Promise<{
    items: Array<z.infer<typeof core.connector_config>>
    total: number
    limit: number
    offset: number
  }>
}) {
  const initialData = use(props.initialData ?? Promise.resolve(undefined))
  const trpc = useTRPC()
  const res = useSuspenseQuery(
    trpc.listConnectorConfigs.queryOptions(
      {expand: 'enabled_integrations'},
      (initialData ? {initialData} : undefined) as never,
    ),
  )

  const connectorConfigs = res.data.items

  return (
    <ul>
      {connectorConfigs.map((connectorConfig) => (
        <li key={connectorConfig.id} className="ml-4 list-disc">
          <pre className="overflow-auto rounded bg-gray-100 p-4">
            {JSON.stringify(connectorConfig, null, 2)}
          </pre>
        </li>
      ))}
      {res.isFetching && <em>Loading...</em>}
      <button
        onClick={() => res.refetch()}
        className="mt-4 rounded bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600"
        disabled={res.isFetching}>
        {res.isFetching ? 'Refreshing...' : 'Refresh Connector Configs'}
      </button>
    </ul>
  )
}
