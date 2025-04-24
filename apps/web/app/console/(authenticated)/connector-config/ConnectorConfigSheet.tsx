'use client'

import type {ConnectorConfig, Core} from '@openint/api-v1/models'

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
import {
  AddConnectorConfig,
  getChangedFields,
  JSONSchemaForm,
} from '@openint/ui-v1'
import {useConfirm} from '@openint/ui-v1/components/Confirm'
import {useMutation, useTRPC} from '@/lib-client/TRPCApp'

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

interface FormData {
  displayName: string
  disabled: boolean
  config?: Core['connector_config_insert']['config']
  [key: string]: unknown
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
  const [formState, setFormState] = useState<FormData | null>(null)
  const [changedFields, setChangedFields] = useState<string[]>([])

  const trpc = useTRPC()
  const createConfig = useMutation(trpc.createConnectorConfig.mutationOptions())
  const updateConfig = useMutation(trpc.updateConnectorConfig.mutationOptions())
  const deleteConfig = useMutation(trpc.deleteConnectorConfig.mutationOptions())

  const confirm = useConfirm()

  const compareFormState = useCallback(() => {
    if (selectedCcfg != null && formState) {
      const {disabled, display_name, config} = selectedCcfg
      return getChangedFields(formState, {
        disabled,
        displayName: display_name,
        ...config,
      })
    }
    return []
  }, [selectedCcfg, formState])

  useEffect(() => {
    const newChangedFields = compareFormState()
    setChangedFields(newChangedFields)
  }, [compareFormState])

  const initialValues = selectedCcfg
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

  const discardChanges = () => {
    setSheetOpen(false)
    setSelectedConnector(null)
    setSelectedCcfg(null)
    setChangedFields([])
    setFormState(initialValues)
  }

  const saveData = async () => {
    if (!formState || !selectedConnector) return
    const {displayName, disabled, config = {}, ...rest} = formState

    const baseData = {
      display_name: displayName,
      disabled: disabled ?? false,
      config: {
        ...config,
        ...rest,
      },
    }
    try {
      let res
      if (selectedCcfg) {
        res = await updateConfig.mutateAsync({
          ...baseData,
          id: selectedCcfg.id,
        })
      } else {
        res = await createConfig.mutateAsync({
          ...baseData,
          connector_name: selectedConnector.name,
        })
      }

      toast.success(
        `Connector ${res.id} ${selectedCcfg ? 'updated' : 'created'} successfully`,
      )

      await refetch()
      setSheetOpen(false)
      setSelectedConnector(null)
      setSelectedCcfg(null)
      setChangedFields([])
    } catch (error) {
      toast.error(
        `Failed to save connector configuration: ${error instanceof Error ? error.message : error}`,
      )
    }
  }

  const handleConfirmReconnect = async () => {
    if (changedFields.length === 0 || !selectedConnector || !formState) return

    await saveData()
  }

  const handleSave = async () => {
    const changedFields = getChangedFields(formState, {
      disabled: selectedCcfg?.disabled,
      displayName: selectedCcfg?.display_name,
      ...selectedCcfg?.config,
    })
    const hasOauthChanges = changedFields.some((field) => field === 'oauth')
    if (selectedCcfg && hasOauthChanges) {
      confirm({
        title: 'OAuth Credentials Changed',
        description:
          'You have changed the OAuth credentials. This will require reconnecting any existing connections using these credentials. Are you sure you want to proceed?',
        onConfirm: async () => {
          await handleConfirmReconnect()
        },
      })
      return
    }
    await saveData()
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

  const handleFormChange = useCallback((data: {formData?: FormData}) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    timeoutRef.current = setTimeout(() => {
      if (data.formData) {
        setFormState(data.formData)
      }
    }, 300)
  }, [])

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
            if (changedFields.length > 0) {
              confirm({
                title: 'Discard Changes',
                description:
                  'You have unsaved changes. Are you sure you want to discard these changes? All information will be lost.',
                onConfirm: discardChanges,
              })
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
                  jsonSchema={formSchema}
                  hideSubmitButton
                  formData={initialValues}
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
                  onClick={handleSave}
                  disabled={
                    createConfig.isPending ||
                    updateConfig.isPending ||
                    !formState ||
                    (selectedCcfg != null && changedFields.length === 0)
                  }>
                  {saveButtonLabel}
                </Button>
              </div>
            </SheetFooter>
          )}
        </SheetContent>
      </Sheet>
    </>
  )
}
