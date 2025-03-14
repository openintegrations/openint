'use client'

import Image from 'next/image'
import {use} from 'react'
import type {core} from '@openint/api-v1/models'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@openint/shadcn/ui/table'
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
      {expand: 'enabled_integrations,connector'},
      (initialData ? {initialData} : undefined) as never,
    ),
  )

  const connectorConfigs = res.data.items

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Connector Name</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead>Updated At</TableHead>
            <TableHead>Config</TableHead>
            <TableHead>Integrations</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {connectorConfigs.map((ccfg) => (
            <TableRow key={ccfg.id}>
              <TableCell>
                <div className="flex items-center space-x-2">
                  {ccfg.connector?.logo_url ? (
                    <Image
                      src={ccfg.connector.logo_url}
                      alt={`${ccfg.connector_name} logo`}
                      width={32}
                      height={32}
                      className="object-contain"
                    />
                  ) : (
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-200">
                      <span className="text-xs text-gray-500">
                        {ccfg.connector_name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <span>
                    {ccfg.connector_name.charAt(0).toUpperCase() +
                      ccfg.connector_name.slice(1)}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                {new Date(ccfg.created_at).toLocaleString()}
              </TableCell>
              <TableCell>
                {new Date(ccfg.updated_at).toLocaleString()}
              </TableCell>
              <TableCell>
                <details>
                  <summary className="cursor-pointer text-sm text-blue-600">
                    View
                  </summary>
                  <pre className="mt-2 max-h-60 overflow-auto rounded bg-gray-50 p-2 text-xs">
                    {JSON.stringify(ccfg.config, null, 2)}
                  </pre>
                </details>
              </TableCell>
              <TableCell>
                {ccfg.integrations ? (
                  <details>
                    <summary className="cursor-pointer text-sm text-blue-600">
                      View
                    </summary>
                    <pre className="mt-2 max-h-60 overflow-auto rounded bg-gray-50 p-2 text-xs">
                      {JSON.stringify(ccfg.integrations, null, 2)}
                    </pre>
                  </details>
                ) : (
                  <span className="text-gray-400">None</span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <button
        onClick={() => res.refetch()}
        className="mt-4 rounded bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600"
        disabled={res.isFetching}>
        {res.isFetching ? 'Refreshing...' : 'Refresh Connector Configs'}
      </button>
    </div>
  )
}
