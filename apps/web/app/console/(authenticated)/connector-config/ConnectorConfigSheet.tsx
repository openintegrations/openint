'use client'

import type {ConnectorName, Core} from '@openint/api-v1/models'
import type {Id} from '@openint/cdk/id.types'

import {skipToken, useQueries} from '@tanstack/react-query'
import {ArrowLeft} from 'lucide-react'
import {useCallback, useRef, useState} from 'react'
import {Button} from '@openint/shadcn/ui'
import {Sheet, SheetContent, SheetTitle} from '@openint/shadcn/ui/sheet'
import {useConfirm} from '@openint/ui-v1/components/ConfirmAlert'
import {useTRPC} from '@/lib-client/TRPCApp'
import {AddConnectorConfigWrapper} from './AddConnectorConfigWrapper'
import {ConnectorConfigDetails} from './ConnectorConfigDetails'

type ConnectorConfigSheetProps = {
  sheetOpen: boolean
  onCloseSheet: () => void
  connectorConfigId: Id['ccfg'] | null
}

export function ConnectorConfigSheet({
  sheetOpen,
  onCloseSheet,
  connectorConfigId,
}: ConnectorConfigSheetProps) {
  // For passing to form components
  const changedFieldsRef = useRef<string[]>([])

  // Track form interaction directly instead of relying on changedFieldsRef
  const [hasUserInteracted, setHasUserInteracted] = useState(false)

  const [connectorName, setConnectorName] = useState<ConnectorName | undefined>(
    undefined,
  )

  const confirmAlert = useConfirm()
  const trpc = useTRPC()

  // Fetch connector details if we have a name
  const [connectorData] = useQueries({
    queries: [
      {
        ...trpc.getConnectorByName.queryOptions(
          connectorName
            ? {
                name: connectorName,
                expand: ['schemas'],
              }
            : skipToken,
        ),
      },
    ],
  })

  const reset = useCallback(() => {
    changedFieldsRef.current = []
    setHasUserInteracted(false)
  }, [])

  const handleSelectConnector = useCallback(
    (connector: Core['connector']) => {
      setConnectorName(connector.name as ConnectorName)
      reset()
    },
    [reset],
  )

  const handleBackToList = useCallback(async () => {
    // Only show confirmation if user has interacted with the form
    if (hasUserInteracted) {
      const confirmed = await confirmAlert({
        title: 'Discard Changes',
        description:
          'You have unsaved changes. Are you sure you want to discard these changes? All information will be lost.',
      })

      if (!confirmed) {
        return
      }
    }

    setConnectorName(undefined)
    reset()
  }, [confirmAlert, hasUserInteracted, reset])

  const handleOpenChange = useCallback(
    async (open: boolean) => {
      if (!open) {
        // Only show confirmation if user has interacted with the form
        if (hasUserInteracted) {
          const confirmed = await confirmAlert({
            title: 'Discard Changes',
            description:
              'You have unsaved changes. Are you sure you want to discard these changes? All information will be lost.',
          })

          if (!confirmed) {
            return
          }
        }

        if (connectorName) {
          setConnectorName(undefined)
        } else {
          onCloseSheet()
        }

        reset()
      }
    },
    [confirmAlert, connectorName, hasUserInteracted, onCloseSheet, reset],
  )

  const handleSuccess = useCallback(() => {
    onCloseSheet()
    reset()
  }, [onCloseSheet, reset])

  // This function is called when user interacts with form fields
  const handleFormChange = useCallback(() => {
    setHasUserInteracted(true)
  }, [])

  return (
    <Sheet open={sheetOpen} onOpenChange={handleOpenChange}>
      <SheetContent
        side="right"
        className="w-full p-0 backdrop-blur-xl sm:max-w-[550px]">
        <div className="flex h-full flex-col">
          <div className="flex items-center border-b p-5">
            {connectorName && !connectorConfigId && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleBackToList}
                className="mr-2 h-8 w-8">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <SheetTitle className="text-xl font-semibold tracking-tight">
              {connectorConfigId
                ? 'Connector Details'
                : connectorName
                  ? `Add ${connectorData.data?.display_name || connectorName} Connector`
                  : 'Add Connector'}
            </SheetTitle>
          </div>

          <div className="flex-1 overflow-y-auto">
            {!connectorConfigId && !connectorName ? (
              <AddConnectorConfigWrapper
                onSelectConnector={handleSelectConnector}
              />
            ) : connectorConfigId ? (
              <ConnectorConfigDetails
                changedFieldsRef={changedFieldsRef}
                successCallback={handleSuccess}
                connectorConfigId={connectorConfigId}
                onFormChange={handleFormChange}
              />
            ) : (
              connectorName && (
                <ConnectorConfigDetails
                  changedFieldsRef={changedFieldsRef}
                  successCallback={handleSuccess}
                  connectorName={connectorName}
                  onFormChange={handleFormChange}
                />
              )
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
