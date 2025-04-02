'use client'

import {ArrowLeft, Plus} from 'lucide-react'
import {useRef, useState} from 'react'
import type {ConnectorConfig, Core} from '@openint/api-v1/models'
import type {AppRouterOutput} from '@openint/api-v1/routers'
import {Button} from '@openint/shadcn/ui'
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetTitle,
} from '@openint/shadcn/ui/sheet'
import {DataTable, type ColumnDef} from '@openint/ui-v1/components/DataTable'
import {
  JSONSchemaForm,
  type SchemaFormElement,
} from '@openint/ui-v1/components/schema-form/JSONSchemaForm'
import {AddConnectorConfig} from '@openint/ui-v1/domain-components/AddConnectorConfig'
import {ConnectorTableCell} from '@openint/ui-v1/domain-components/ConnectorTableCell'
import {useMutation, useSuspenseQuery} from '@openint/ui-v1/trpc'
import {useTRPC} from '../client'

export function ConnectorConfigList(props: {
  initialData?: {
    items: Array<
      ConnectorConfig<'connector' | 'integrations' | 'connection_count'>
    >
    total: number
    limit: number
    offset: number
  }
  initialConnectorData?: AppRouterOutput['listConnectors']
}) {
  const [sheetOpen, setSheetOpen] = useState(false)
  const [selectedConnector, setSelectedConnector] = useState<
    Core['connector'] | null
  >(null)
  const [selectedCcfg, setSelectedCcfg] = useState<ConnectorConfig<
    'connector' | 'integrations' | 'connection_count'
  > | null>(null)
  const formRef = useRef<SchemaFormElement>(null)

  const {initialData, initialConnectorData} = props

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
      initialConnectorData ? {initialData: initialConnectorData} : undefined,
    ),
  )

  const connectorConfigs = res.data.items
  const formSchema = {
    type: 'object' as const,
    properties: {
      displayName: {
        type: 'string' as const,
        title: 'Display Name',
        description: 'A friendly name for this connector configuration',
      },
      disabled: {
        type: 'boolean' as const,
        title: 'Disabled',
        description:
          'When disabled it will not be used for connection portal. Essentially a reversible soft-delete',
      },
      ...((
        selectedConnector?.schemas?.connector_config as Record<string, unknown>
      )?.['properties'] || {}),
    },
  }

  const formData = selectedCcfg
    ? {
        ...selectedCcfg.config,
        displayName: selectedCcfg.display_name ?? '',
        disabled: selectedCcfg.disabled ?? false,
      }
    : {}

  const formContext = {
    connectorName: selectedConnector?.display_name ?? '',
    openint_scopes: selectedConnector?.openint_scopes ?? [],
    scopes: selectedConnector?.scopes ?? [],
  }

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
        return connector ? <ConnectorTableCell connector={connector} /> : null
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
    const fullConnector = connectorRes.data.find(
      (c) => c.name === ccfg.connector?.name,
    )

    setSelectedCcfg(ccfg)
    // Use the full connector data if available, otherwise use the one from ccfg
    setSelectedConnector(fullConnector || ccfg.connector || null)
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

  const createConfig = useMutation(trpc.createConnectorConfig.mutationOptions())
  const updateConfig = useMutation(trpc.updateConnectorConfig.mutationOptions())
  const deleteConfig = useMutation(trpc.deleteConnectorConfig.mutationOptions())

  const handleSave = async (data: {
    formData: {
      displayName: string
      disabled: boolean
      config?: Record<string, unknown>
      [key: string]: unknown
    }
  }) => {
    if (!selectedConnector) {
      return
    }

    const {
      formData: {displayName, disabled, config, ...rest},
    } = data

    try {
      if (selectedCcfg) {
        await updateConfig.mutateAsync({
          id: selectedCcfg.id,
          display_name: displayName,
          disabled,
          config: {
            ...config,
            ...rest,
          },
        })
      } else {
        await createConfig.mutateAsync({
          connector_name: selectedConnector.name,
          display_name: displayName,
          disabled,
          config: {
            ...config,
            ...rest,
          },
        })
      }

      setSheetOpen(false)
      setSelectedConnector(null)
      setSelectedCcfg(null)
      await res.refetch()
    } catch (error) {
      console.error('Error saving configuration:', error)
    }
  }

  const handleFormSubmit = () => {
    if (formRef.current) {
      formRef.current.submit()
    }
  }

  const handleDelete = async () => {
    if (!selectedCcfg) return

    try {
      await deleteConfig.mutateAsync({
        id: selectedCcfg.id,
      })

      setSheetOpen(false)
      setSelectedConnector(null)
      setSelectedCcfg(null)
      await res.refetch()
    } catch (error) {
      console.error('Failed to delete connector config:', error)
      // TODO: We need to show a toast here
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
          <Button
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

      <Sheet
        open={sheetOpen}
        onOpenChange={(open) => {
          setSheetOpen(open)
          if (!open) {
            setSelectedConnector(null)
            setSelectedCcfg(null)
          }
        }}>
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
          {selectedConnector ? (
            <>
              <JSONSchemaForm
                ref={formRef}
                jsonSchema={formSchema}
                onSubmit={handleSave}
                hideSubmitButton
                formData={formData}
                formContext={formContext}
              />
              <SheetFooter className="mt-auto flex flex-row justify-between border-t pt-4">
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={!selectedCcfg || deleteConfig.isPending}>
                  {deleteConfig.isPending ? 'Deleting...' : 'Delete'}
                </Button>
                <Button
                  onClick={handleFormSubmit}
                  disabled={createConfig.isPending || updateConfig.isPending}>
                  {createConfig.isPending || updateConfig.isPending
                    ? 'Saving...'
                    : 'Save'}
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
    </div>
  )
}
