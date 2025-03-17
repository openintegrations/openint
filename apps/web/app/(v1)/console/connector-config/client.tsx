'use client'

import {Plus} from 'lucide-react'
import {use, useState} from 'react'
import type {ConnectorConfig, Core} from '@openint/api-v1/models'
import {Button} from '@openint/shadcn/ui'
import {Sheet, SheetContent, SheetTrigger} from '@openint/shadcn/ui/sheet'
import {DataTable, type ColumnDef} from '@openint/ui-v1/components/DataTable'
import {AddConnectorConfig} from '@openint/ui-v1/domain-components/AddConnectorConfig'
import {ConnectorTableCell} from '@openint/ui-v1/domain-components/ConnectorTableCell'
import {useSuspenseQuery} from '@openint/ui-v1/trpc'
import {useTRPC} from '../client'

export function ConnectorConfigListHeader(props: {
  initialData?: Promise<{
    items: Array<Core['connector']>
    total: number
    limit: number
    offset: number
  }>
}) {
  const initialData = use(props.initialData ?? Promise.resolve(undefined))
  const [sheetOpen, setSheetOpen] = useState(false)
  const trpc = useTRPC()
  const res = useSuspenseQuery(
    trpc.listConnectors.queryOptions(
      {},
      initialData ? {initialData: initialData.items} : undefined,
    ),
  )

  return (
    <div className="flex justify-between">
      <h1 className="text-2xl font-bold">Connector Configs</h1>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetTrigger asChild>
          <Button>
            <Plus className="size-4" />
            Add Connector
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="min-w-1/3">
          <AddConnectorConfig
            connectors={res.data}
            onSelectConnector={() => {
              setSheetOpen(false)
              res.refetch()
            }}
          />
        </SheetContent>
      </Sheet>
    </div>
  )
}

export function ConnectorConfigList(props: {
  initialData?: Promise<{
    items: Array<
      ConnectorConfig<'connector' | 'integrations' | 'connection_count'>
    >
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
      initialData ? {initialData} : undefined,
    ),
  )

  const connectorConfigs = res.data.items

  const connectorColumns: Array<
    ColumnDef<
      ConnectorConfig<'connector' | 'integrations' | 'connection_count'>
    >
  > = [
    {
      id: 'connector',
      header: 'Connector',
      accessorKey: 'display_name',
      cell: ({row}) => {
        const connector = row.original.connector
        return (
          <ConnectorTableCell
            connector={{...connector, stage: connector.stage || 'alpha'}}
          />
        )
      },
    },
    {
      id: 'connections',
      header: 'Connections',
      cell: ({row}) => row.original.connection_count,
    },
    {
      id: 'status',
      header: 'Status',
      cell: () => <span className="text-gray-400">--</span>,
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: () => {
        // Empty placeholder
        return (
          <Button variant="ghost" size="sm">
            View
          </Button>
        )
      },
    },
  ]

  return (
    <div>
      <DataTable<
        ConnectorConfig<'connector' | 'integrations' | 'connection_count'>,
        string | number | string[]
      >
        data={connectorConfigs}
        columns={connectorColumns}>
        <DataTable.Header>
          <DataTable.SearchInput />
          <DataTable.ColumnVisibilityToggle />
          <Button className="ml-4">Add Connector</Button>
        </DataTable.Header>
        <DataTable.Table />
        <DataTable.Footer>
          <DataTable.Pagination />
        </DataTable.Footer>
      </DataTable>
    </div>
  )
}
