'use client'

import type {ConnectorConfig, Core} from '@openint/api-v1/models'
import type {JSONSchemaFormRef} from '@openint/ui-v1'
import type {ColumnDef} from '@openint/ui-v1/components/DataTable'

import {useSuspenseQueries} from '@tanstack/react-query'
import {AlertCircle, Plus} from 'lucide-react'
import {useCallback, useEffect, useRef, useState} from 'react'
import {
  Button,
  toast,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@openint/shadcn/ui'
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@openint/shadcn/ui/sheet'
import {
  AddConnectorConfig,
  ConnectorTableCell,
  JSONSchemaForm,
} from '@openint/ui-v1'
import {DataTable} from '@openint/ui-v1/components/DataTable'
import {getChangedFields} from '@openint/ui-v1/formUtils'
import {useMutation, useTRPC} from '@/lib-client/TRPCApp'
import {DiscardChangesAlert} from './DiscardChangesAlert'
import {ReconnectAlert} from './ReconnectAlert'

const DATA_PER_PAGE = 20

export function ConnectorConfigList() {
  const [sheetOpen, setSheetOpen] = useState(false)
  const [selectedConnector, setSelectedConnector] = useState<
    Core['connector'] | null
  >(null)
  const [selectedCcfg, setSelectedCcfg] = useState<ConnectorConfig<
    'connector' | 'integrations' | 'connection_count'
  > | null>(null)
  const formRef = useRef<JSONSchemaFormRef>(null)
  const [pageIndex, setPageIndex] = useState(0)
  const [showReconnectDialog, setShowReconnectDialog] = useState(false)
  const [showDiscardAlert, setShowDiscardAlert] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [formState, setFormState] = useState<Record<string, unknown> | null>(
    null,
  )
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const handleFormChange = useCallback(
    (data: {formData?: Record<string, unknown>}) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      timeoutRef.current = setTimeout(() => {
        if (data.formData) {
          setFormState(data.formData)
        }
      }, 300)
    },
    [],
  )

  useEffect(() => {
    if (selectedCcfg != null && formState) {
      const {disabled, display_name, config} = selectedCcfg
      const changedFields = getChangedFields(formState, {
        disabled,
        displayName: display_name,
        ...config,
      })
      setHasChanges(changedFields.length > 0)
    }
  }, [selectedCcfg, formState])

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

  const formSchema = {
    type: 'object' as const,
    properties: {
      disabled: {
        type: 'boolean' as const,
        title: 'Disabled',
        description:
          'When disabled it will not be used for connection portal. Essentially a reversible soft-delete',
        'ui:field': 'DisabledField',
      },
      displayName: {
        type: 'string' as const,
        title: 'Display Name',
        description: 'A friendly name for this connector configuration',
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
    openint_scopes: selectedConnector?.openint_scopes ?? [],
    scopes: selectedConnector?.scopes ?? [],
    initialData: selectedCcfg,
    connector: selectedConnector,
  }

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

  const handleSelectConnector = async (connector: Core['connector']) => {
    setSelectedConnector(connector)
    setSelectedCcfg(null)
  }

  const createConfig = useMutation(trpc.createConnectorConfig.mutationOptions())
  const updateConfig = useMutation(trpc.updateConnectorConfig.mutationOptions())
  const deleteConfig = useMutation(trpc.deleteConnectorConfig.mutationOptions())

  const handleSave = async (data: {
    formData: {
      displayName: string
      disabled: boolean
      config?: Core['connector_config_insert']['config']
      [key: string]: unknown
    }
  }) => {
    if (!selectedConnector) {
      return
    }

    const {
      formData: {displayName, disabled, config = {}, ...rest},
    } = data

    try {
      if (selectedCcfg) {
        const changedFields = getChangedFields(formState, {
          disabled,
          displayName: displayName,
          ...config,
        })
        const hasOauthChanges = changedFields.some((field) => field === 'oauth')
        if (hasOauthChanges) {
          setShowReconnectDialog(hasOauthChanges)
          return
        } else {
          const res = await updateConfig.mutateAsync({
            id: selectedCcfg.id,
            display_name: displayName,
            disabled,
            config: {
              ...config,
              ...rest,
            },
          })
          toast.success(`Connector ${res.id} updated successfully`)
        }
      } else {
        const res = await createConfig.mutateAsync({
          connector_name: selectedConnector.name,
          display_name: displayName,
          disabled,
          config: {
            ...config,
            ...rest,
          },
        })
        toast.success(`Connector ${res.id} created successfully`)
      }

      await res.refetch()
      setSheetOpen(false)
      setSelectedConnector(null)
      setSelectedCcfg(null)
      setHasChanges(false)
    } catch (error) {
      toast.error(
        `Failed to save connector configuration: ${error instanceof Error ? error.message : error}`,
      )
    }
  }

  const handleConfirmReconnect = async () => {
    if (!hasChanges || !selectedConnector || !formState) return

    try {
      if (selectedCcfg) {
        const res = await updateConfig.mutateAsync({
          id: selectedCcfg.id,
          display_name: formState['displayName'] as string,
          disabled: formState['disabled'] as boolean,
          config: {
            ...formState,
          },
        })
        toast.success(
          `Connector ${res.id} updated successfully. Please reconnect your connections.`,
        )
      }

      await res.refetch()
      setSheetOpen(false)
      setSelectedConnector(null)
      setSelectedCcfg(null)
      setShowReconnectDialog(false)
      setHasChanges(false)
    } catch (error) {
      toast.error(
        `Failed to save connector configuration: ${error instanceof Error ? error.message : error}`,
      )
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
      toast.success(`Connector config ${selectedCcfg?.id} deleted successfully`)
      await res.refetch()
    } catch (error) {
      toast.error(
        `Failed to delete connector config ${selectedCcfg?.id}: ${error instanceof Error ? error.message : error}`,
      )
    }
  }

  const saveButtonLabel =
    createConfig.isPending || updateConfig.isPending
      ? selectedCcfg
        ? 'Updating...'
        : 'Creating...'
      : selectedCcfg
        ? `Edit ${selectedConnector?.display_name} Connector`
        : `Create ${selectedConnector?.display_name} Connector`

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

      <Sheet
        open={sheetOpen}
        onOpenChange={(open) => {
          if (selectedConnector && !selectedCcfg) {
            setSelectedConnector(null)
          } else if (selectedCcfg) {
            if (hasChanges) {
              setShowDiscardAlert(true)
              return
            }
            setSelectedConnector(null)
            setSelectedCcfg(null)
            setSheetOpen(open)
          } else {
            setSheetOpen(open)
          }
        }}>
        <SheetContent
          side="right"
          className="sm:min-w-1/3 flex max-h-screen w-full flex-col overflow-hidden p-0">
          <div className="p-4 pb-0">
            <SheetHeader>
              <SheetTitle className="text-lg">
                {selectedCcfg ? 'Edit Connector' : 'Add Connector'}
              </SheetTitle>
            </SheetHeader>
          </div>

          <div className="flex-1 overflow-y-auto">
            {selectedConnector ? (
              <div className="px-8">
                <JSONSchemaForm
                  ref={formRef}
                  jsonSchema={formSchema}
                  onSubmit={handleSave}
                  hideSubmitButton
                  formData={formData}
                  formContext={formContext}
                  onChange={handleFormChange}
                />
              </div>
            ) : (
              <AddConnectorConfig
                connectors={connectorRes.data.items}
                onSelectConnector={handleSelectConnector}
              />
            )}
          </div>
          {selectedConnector && (
            <SheetFooter className="mt-auto border-t p-4">
              <div className="flex w-full flex-row justify-between">
                <div className="flex flex-row items-center gap-2">
                  {selectedCcfg?.connection_count ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <AlertCircle className="text-destructive size-4" />
                      </TooltipTrigger>
                      <TooltipContent>
                        Cannot delete connector config because it has active
                        connections, delete the connections before deleting the
                        connector config.
                      </TooltipContent>
                    </Tooltip>
                  ) : null}
                  <Button
                    variant="destructive"
                    onClick={handleDelete}
                    disabled={
                      !selectedCcfg ||
                      deleteConfig.isPending ||
                      (selectedCcfg.connection_count ?? 0) > 0
                    }>
                    {deleteConfig.isPending ? 'Deleting...' : 'Delete'}
                  </Button>
                </div>
                <Button
                  onClick={handleFormSubmit}
                  disabled={createConfig.isPending || updateConfig.isPending}>
                  {saveButtonLabel}
                </Button>
              </div>
            </SheetFooter>
          )}
        </SheetContent>
      </Sheet>
      <ReconnectAlert
        showReconnectDialog={showReconnectDialog}
        setShowReconnectDialog={setShowReconnectDialog}
        handleConfirmReconnect={handleConfirmReconnect}
      />
      <DiscardChangesAlert
        connectorName={selectedConnector?.display_name ?? ''}
        showDiscardAlert={showDiscardAlert}
        setShowDiscardAlert={setShowDiscardAlert}
        discardChanges={() => {
          setSheetOpen(false)
          setSelectedConnector(null)
          setSelectedCcfg(null)
          setShowDiscardAlert(false)
          setHasChanges(false)
        }}
      />
    </div>
  )
}
