'use client'

import type {ConnectorConfig, Core} from '@openint/api-v1/models'
import type {FormData} from '@openint/ui-v1'

import {useState} from 'react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@openint/shadcn/ui/sheet'
import {AddConnectorConfig, ConnectorConfigForm} from '@openint/ui-v1'
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
  const [changedFields, setChangedFields] = useState<string[]>([])

  const trpc = useTRPC()
  const createConfig = useMutation(trpc.createConnectorConfig.mutationOptions())
  const updateConfig = useMutation(trpc.updateConnectorConfig.mutationOptions())
  const deleteConfig = useMutation(trpc.deleteConnectorConfig.mutationOptions())

  const confirm = useConfirm()

  const discardChanges = () => {
    setSheetOpen(false)
    setSelectedConnector(null)
    setSelectedCcfg(null)
    setChangedFields([])
  }

  const saveData = async (formState: FormData) => {
    if (!formState || !selectedConnector) return
    const {displayName, disabled, config = {}, ...rest} = formState

    const baseData = {
      display_name: displayName,
      disabled,
      config: {
        ...config,
        ...rest,
      },
    }

    if (selectedCcfg) {
      await updateConfig.mutateAsync({
        ...baseData,
        id: selectedCcfg.id,
      })
    } else {
      await createConfig.mutateAsync({
        ...baseData,
        connector_name: selectedConnector.name,
      })
    }

    await refetch()
    setSheetOpen(false)
    setSelectedConnector(null)
    setSelectedCcfg(null)
    setChangedFields([])
  }

  const handleDelete = async () => {
    if (!selectedCcfg) return

    await deleteConfig.mutateAsync({
      id: selectedCcfg.id,
    })

    setSheetOpen(false)
    setSelectedConnector(null)
    setSelectedCcfg(null)
    await refetch()
  }

  const handleSelectConnector = (connector: Core['connector']) => {
    setSelectedConnector(connector)
    setSelectedCcfg(null)
  }

  const saveButtonLabel =
    createConfig.isPending || updateConfig.isPending
      ? selectedCcfg
        ? 'Saving...'
        : 'Adding...'
      : selectedCcfg
        ? `Save ${selectedConnector?.display_name} Connector`
        : `Add ${selectedConnector?.display_name} Connector`

  const isSaveDisabled = createConfig.isPending || updateConfig.isPending

  const isDeleteDisabled =
    !selectedCcfg ||
    deleteConfig.isPending ||
    (selectedCcfg.connection_count ?? 0) > 0

  const onOpenChange = (open: boolean) => {
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
  }

  return (
    <Sheet open={sheetOpen} onOpenChange={onOpenChange}>
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
            <ConnectorConfigForm
              configSchema={selectedConnector?.schemas?.connector_config}
              connector={selectedConnector}
              connectorConfig={selectedCcfg}
              onSave={saveData}
              onDelete={handleDelete}
              saveButtonLabel={saveButtonLabel}
              isSaveDisabled={isSaveDisabled}
              isDeleteDisabled={isDeleteDisabled}
              isDeletePending={deleteConfig.isPending}
              changedFields={changedFields}
              setChangedFields={setChangedFields}
            />
          ) : (
            <AddConnectorConfig
              connectors={connectors}
              onSelectConnector={handleSelectConnector}
            />
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
