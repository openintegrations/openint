'use client'

import type {ConnectorConfig, Core} from '@openint/api-v1/models'
import type {ColumnDef} from '@openint/ui-v1/components/DataTable'

import {useSuspenseQueries} from '@tanstack/react-query'
import {Plus} from 'lucide-react'
import {useState} from 'react'
import {Button} from '@openint/shadcn/ui'
import {ConnectorTableCell} from '@openint/ui-v1'
import {DataTable} from '@openint/ui-v1/components/DataTable'
import {useTRPC} from '@/lib-client/TRPCApp'
import {ConnectorConfigSheet} from './ConnectorConfigSheet'

const DATA_PER_PAGE = 20

export function ConnectorConfigList() {
  const [sheetOpen, setSheetOpen] = useState(false)
  const [selectedConnector, setSelectedConnector] = useState<
    Core['connector'] | null
  >(null)
  const [selectedCcfg, setSelectedCcfg] = useState<ConnectorConfig<
    'connector' | 'integrations' | 'connection_count'
  > | null>(null)
  const [pageIndex, setPageIndex] = useState(0)

  const trpc = useTRPC()

  // Must use multiple queries to avoid waterfall and allow server prefetch to work
  const [res, connectorRes] = useSuspenseQueries({
    queries: [
      trpc.listConnectorConfigs.queryOptions({
        expand: ['connection_count', 'connector.schemas'],
        limit: DATA_PER_PAGE,
        offset: pageIndex * DATA_PER_PAGE,
      }),
      trpc.listConnectors.queryOptions({
        expand: ['schemas'],
      }),
    ],
  })

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
    // Find the full connector data from the connectors list
    const fullConnector = connectorRes.data.items.find(
      (c) => c.name === ccfg.connector?.name,
    )

    setSelectedCcfg(ccfg)
    // Use the full connector data if available, otherwise use the one from ccfg
    setSelectedConnector(fullConnector || ccfg.connector || null)
    setSheetOpen(true)
  }

  // initial flash of no data....
  if (!res.data.items || !connectorRes.data.items) {
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
          <DataTable.SearchInput />
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
        setSheetOpen={setSheetOpen}
        selectedConnector={selectedConnector}
        setSelectedConnector={setSelectedConnector}
        selectedCcfg={selectedCcfg}
        setSelectedCcfg={setSelectedCcfg}
        connectors={connectorRes.data.items}
        refetch={async () => {
          await res.refetch()
        }}
      />
    </div>
  )
}
