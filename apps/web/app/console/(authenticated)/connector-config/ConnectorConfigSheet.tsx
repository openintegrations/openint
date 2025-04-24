'use client'

import type {ConnectorConfig, Core} from '@openint/api-v1/models'
import type {JSONSchemaFormRef} from '@openint/ui-v1'

import {AlertCircle} from 'lucide-react'
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
import {AddConnectorConfig, JSONSchemaForm} from '@openint/ui-v1'
import {getChangedFields} from '@openint/ui-v1/formUtils'
import {useMutation, useTRPC} from '@/lib-client/TRPCApp'
import {DiscardChangesAlert} from './DiscardChangesAlert'
import {ReconnectAlert} from './ReconnectAlert'

interface ConnectorConfigSheetProps {
  sheetOpen: boolean
  setSheetOpen: (open: boolean) => void
  selectedConnector: Core['connector'] | null
  setSelectedConnector: (connector: Core['connector'] | null) => void
  selectedCcfg: ConnectorConfig<
    'connector' | 'integrations' | 'connection_count'
  > | null
  setSelectedCcfg: (
    ccfg: ConnectorConfig<
      'connector' | 'integrations' | 'connection_count'
    > | null,
  ) => void
  refetch: () => Promise<void>
  connectors: Array<Core['connector']>
}

export function ConnectorConfigSheet({
  sheetOpen,
  setSheetOpen,
  selectedConnector,
  setSelectedConnector,
  selectedCcfg,
  setSelectedCcfg,
  refetch,
  connectors,
}: ConnectorConfigSheetProps) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const formRef = useRef<JSONSchemaFormRef>(null)
  const [formState, setFormState] = useState<Record<string, unknown> | null>(
    null,
  )
  const [showReconnectDialog, setShowReconnectDialog] = useState(false)
  const [showDiscardAlert, setShowDiscardAlert] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  const trpc = useTRPC()
  const createConfig = useMutation(trpc.createConnectorConfig.mutationOptions())
  const updateConfig = useMutation(trpc.updateConnectorConfig.mutationOptions())
  const deleteConfig = useMutation(trpc.deleteConnectorConfig.mutationOptions())

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

  const formContext = {
    openint_scopes: selectedConnector?.openint_scopes ?? [],
    scopes: selectedConnector?.scopes ?? [],
    initialData: selectedCcfg,
    connector: selectedConnector,
  }

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

  const handleFormSubmit = () => {
    if (formRef.current) {
      formRef.current.submit()
    }
  }

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
        const changedFields: Array<
          | keyof Core['connector_config_insert']
          | keyof Core['connector_config_insert']['config']
        > = getChangedFields(formState, {
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

      await refetch()
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

      await refetch()
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
      await refetch()
    } catch (error) {
      toast.error(
        `Failed to delete connector config ${selectedCcfg?.id}: ${error instanceof Error ? error.message : error}`,
      )
    }
  }

  const handleSelectConnector = async (connector: Core['connector']) => {
    setSelectedConnector(connector)
    setSelectedCcfg(null)
  }

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

  const formData = selectedCcfg
    ? {
        ...selectedCcfg.config,
        displayName: selectedCcfg.display_name ?? '',
        disabled: selectedCcfg.disabled ?? false,
      }
    : {}

  const saveButtonLabel =
    createConfig.isPending || updateConfig.isPending
      ? selectedCcfg
        ? 'Updating...'
        : 'Creating...'
      : selectedCcfg
        ? `Edit ${selectedConnector?.display_name} Connector`
        : `Create ${selectedConnector?.display_name} Connector`

  return (
    <>
      <Sheet
        open={sheetOpen}
        onOpenChange={(open: boolean) => {
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
                connectors={connectors}
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
    </>
  )
}
