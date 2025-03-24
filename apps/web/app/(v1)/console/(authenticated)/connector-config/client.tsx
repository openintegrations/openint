'use client'

import {ArrowLeft, Plus} from 'lucide-react'
import {use, useState} from 'react'
import type {ConnectorConfig, Core} from '@openint/api-v1/models'
import type {AppRouterOutput} from '@openint/api-v1/routers'
import {Button} from '@openint/shadcn/ui'
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetTitle,
  SheetTrigger,
} from '@openint/shadcn/ui/sheet'
import {DataTable, type ColumnDef} from '@openint/ui-v1/components/DataTable'
import {JSONSchemaForm} from '@openint/ui-v1/components/schema-form/SchemaForm'
import {AddConnectorConfig} from '@openint/ui-v1/domain-components/AddConnectorConfig'
import {ConnectorTableCell} from '@openint/ui-v1/domain-components/ConnectorTableCell'
import {useMutation, useSuspenseQuery} from '@openint/ui-v1/trpc'
import {useTRPC} from '../client'

export function ConnectorConfigList(props: {
  initialData?: Promise<{
    items: Array<
      ConnectorConfig<'connector' | 'integrations' | 'connection_count'>
    >
    total: number
    limit: number
    offset: number
  }>
  initialConnectorData?: Promise<AppRouterOutput['listConnectors']>
}) {
  const [sheetOpen, setSheetOpen] = useState(false)
  const [selectedConnector, setSelectedConnector] = useState<
    Core['connector'] | null
  >(null)
  const [selectedCcfg, setSelectedCcfg] = useState<ConnectorConfig<
    'connector' | 'integrations' | 'connection_count'
  > | null>(null)

  const initialData = use(props.initialData ?? Promise.resolve(undefined))
  const connectorData = use(
    props.initialConnectorData ?? Promise.resolve(undefined),
  )
  const trpc = useTRPC()
  const res = useSuspenseQuery(
    trpc.listConnectorConfigs.queryOptions(
      {expand: 'enabled_integrations,connector'},
      initialData ? {initialData} : undefined,
    ),
  )
  const connectorRes = useSuspenseQuery(
    trpc.listConnectors.queryOptions(
      {},
      connectorData ? {initialData: connectorData} : undefined,
    ),
  )

  const connectorConfigs = res.data.items
  console.log({connectorConfigs})

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
        return (
          <Button variant="ghost" size="sm">
            View
          </Button>
        )
      },
    },
  ]

  const handleRowClick = (
    ccfg: ConnectorConfig<'connector' | 'integrations' | 'connection_count'>,
  ) => {
    // Find the full connector data from the connectors list
    const fullConnector = connectorRes.data.find(
      (c) => c.name === ccfg.connector.name,
    )

    setSelectedCcfg(ccfg)
    // Use the full connector data if available, otherwise use the one from ccfg
    setSelectedConnector(fullConnector || ccfg.connector)
    setSheetOpen(true)
  }

  const handleSelectConnector = async (connector: Core['connector']) => {
    setSelectedConnector(connector)
    setSelectedCcfg(null)
  }

  const handleBackToConnectors = () => {
    setSelectedConnector(null)
    setSelectedCcfg(null)
  }

  const mutation = useMutation({
    mutationFn: (formData: Record<string, unknown>) =>
      trpc.updateConnectorConfig.mutationOptions({
        input: {
          id: formData['id'] as string,
          config: formData,
        },
      }),
  })

  const handleSubmitConfig = async (data: {
    formData: Record<string, unknown>
  }) => {
    if (!selectedConnector) return

    try {
      if (data.formData['id']) {
        await mutation.mutateAsync({
          id: data.formData['id'] as string,
          config: data.formData,
        })
      } else {
        // Handle create case if needed
        // await createConfig.mutateAsync({
        //   connector_name: selectedConnector.name,
        //   config: data.formData,
        // })
      }

      setSheetOpen(false)
      setSelectedConnector(null)
      setSelectedCcfg(null)
      res.refetch()
    } catch (error) {
      console.error('Failed to save connector config:', error)
      // TODO: Add error handling/notification
    }
  }

  const handleDelete = async () => {
    if (!selectedCcfg) return

    try {
      // Implement delete functionality when available

      setSheetOpen(false)
      setSelectedConnector(null)
      setSelectedCcfg(null)
      res.refetch()
    } catch (error) {
      console.error('Failed to delete connector config:', error)
      // TODO: Add error handling/notification
    }
  }

  return (
    <div>
      <DataTable<
        ConnectorConfig<'connector' | 'integrations' | 'connection_count'>,
        string | number | string[]
      >
        data={connectorConfigs}
        columns={connectorColumns}
        onRowClick={handleRowClick}>
        <DataTable.Header>
          <DataTable.SearchInput />
          <DataTable.ColumnVisibilityToggle />
          <Sheet
            open={sheetOpen}
            onOpenChange={(open) => {
              setSheetOpen(open)
              if (!open) {
                setSelectedConnector(null)
                setSelectedCcfg(null)
              }
            }}>
            <SheetTrigger asChild>
              <Button>
                <Plus className="size-4" />
                Add Connector
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="min-w-1/3 p-4 pb-0">
              <SheetTitle className="flex items-center gap-2">
                {selectedConnector && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={handleBackToConnectors}>
                    <ArrowLeft className="size-4" />
                  </Button>
                )}
                <span className="text-xl font-semibold">
                  {selectedConnector
                    ? `Configure ${selectedConnector.display_name}`
                    : 'Add Connector'}
                </span>
              </SheetTitle>
              {selectedConnector?.schemas?.connection_settings ? (
                <>
                  <JSONSchemaForm
                    jsonSchema={selectedConnector.schemas.connection_settings}
                    onSubmit={handleSubmitConfig}
                    hideSubmitButton={true}
                    formData={
                      selectedCcfg
                        ? {...selectedCcfg.config, id: selectedCcfg.id}
                        : {}
                    }
                  />
                  <SheetFooter className="mt-auto flex flex-row justify-between border-t pt-4">
                    <Button
                      variant="destructive"
                      onClick={handleDelete}
                      disabled={!selectedCcfg}>
                      Delete
                    </Button>
                    <Button type="submit" form="json-schema-form">
                      Save
                    </Button>
                  </SheetFooter>
                </>
              ) : (
                <AddConnectorConfig
                  connectors={connectorRes.data}
                  onSelectConnector={handleSelectConnector}
                />
              )}
            </SheetContent>
          </Sheet>
        </DataTable.Header>
        <DataTable.Table />
        <DataTable.Footer>
          <DataTable.Pagination />
        </DataTable.Footer>
      </DataTable>
    </div>
  )
}
