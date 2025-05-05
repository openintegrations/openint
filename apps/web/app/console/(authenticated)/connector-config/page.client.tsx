'use client'

import type {ConnectorConfig} from '@openint/api-v1/models'
import type {Id} from '@openint/cdk/id.types'
import type {ColumnDef} from '@openint/ui-v1/components/DataTable'

import {useSuspenseQuery} from '@tanstack/react-query'
import {Plus} from 'lucide-react'
import React from 'react'
import {Button} from '@openint/shadcn/ui'
import {ConnectorTableCell, useStateFromSearchParams} from '@openint/ui-v1'
import {DataTable} from '@openint/ui-v1/components/DataTable'
import {useTRPC} from '@/lib-client/TRPCApp'
import {ConnectorConfigSheet} from './ConnectorConfigSheet'

const DATA_PER_PAGE = 20

export function ConnectorConfigList() {
  const [sheetOpen, setSheetOpen] = React.useState(false)
  const [connectorConfigId, setConnectorConfigId] = React.useState<
    Id['ccfg'] | null
  >(null)
  const [pageIndex, setPageIndex] = React.useState(0)
  const [query, setQuery] = useStateFromSearchParams('q', {
    shallow: true,
    defaultValue: '' as string,
  })

  React.useEffect(() => {
    // Reset page index when search params query changes
    setPageIndex(0)
  }, [query])

  const trpc = useTRPC()

  // Must use multiple queries to avoid waterfall and allow server prefetch to work
  const res = useSuspenseQuery(
    trpc.listConnectorConfigs.queryOptions({
      expand: ['connection_count', 'connector.schemas'],
      limit: DATA_PER_PAGE,
      offset: pageIndex * DATA_PER_PAGE,
      search_query: query,
    }),
  )

  const handlePageChange = (newPageIndex: number) => {
    setPageIndex(newPageIndex)
  }

  const connectorConfigs = res.data

  const columns: Array<
    ColumnDef<
      ConnectorConfig<'connector' | 'integrations' | 'connection_count'>
    >
  > = [
    {
      header: 'Connector',
      accessorKey: 'connector_name',
      cell: ({row}) => {
        const connector = row.original.connector
        return connector ? <ConnectorTableCell connector={connector} /> : null
      },
    },
    {
      accessorKey: 'config.oauth.client_id', // how do we get this to be typesafe?
      header: 'Client ID',
    },
    {
      accessorKey: 'config.oauth.redirect_uri', // how do we get this to be typesafe?
      header: 'Redirect URI',
      meta: {
        initialVisibility: false,
      },
    },
    // Add column for whether we are using the default credentials
    {
      accessorKey: 'connection_count',
      header: '# Connections',
    },
    {
      accessorKey: 'disabled',
      header: 'Status',
      cell: ({row}) => (
        <span className="flex items-center gap-2">
          {row.original.disabled ? 'Disabled' : 'Enabled'}
        </span>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: () => (
        <Button variant="ghost" size="sm">
          View
        </Button>
      ),
    },
  ]

  const handleRowClick = (
    ccfg: ConnectorConfig<'connector' | 'integrations' | 'connection_count'>,
  ) => {
    setConnectorConfigId(ccfg.id as Id['ccfg'])
    setSheetOpen(true)
  }

  const onCloseSheet = () => {
    setConnectorConfigId(null)
    setSheetOpen(false)
  }

  // initial flash of no data....
  if (!res.data.items) {
    return null
  }

  return (
    <div className="p-6">
      <DataTable<
        ConnectorConfig<'connector' | 'integrations' | 'connection_count'>,
        string | number | string[]
      >
        data={connectorConfigs}
        columns={columns}
        onRowClick={handleRowClick}
        onPageChange={handlePageChange}
        isLoading={res.isFetching || res.isLoading}>
        <DataTable.Header>
          <DataTable.SearchInput query={query} onQueryChange={setQuery} />
          <DataTable.ColumnVisibilityToggle />
          <Button
            className="ml-4"
            onClick={() => {
              setSheetOpen(true)
            }}>
            <Plus className="size-4" />
            Add Connector
          </Button>
        </DataTable.Header>
        <DataTable.Table />
        <DataTable.Footer>
          <DataTable.Pagination />
        </DataTable.Footer>
      </DataTable>
      <ConnectorConfigSheet
        sheetOpen={sheetOpen}
        onCloseSheet={onCloseSheet}
        connectorConfigId={connectorConfigId}
      />
    </div>
  )
}
