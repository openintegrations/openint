'use client'

import type {ConnectorName, Core} from '@openint/api-v1/models'
import type {Id} from '@openint/cdk/id.types'

import {useRef, useState} from 'react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@openint/shadcn/ui/sheet'
import {useConfirm} from '@openint/ui-v1/components/ConfirmAlert'
import {AddConnectorConfigWrapper} from './AddConnectorConfigWrapper'
import {ConnectorConfigDetails} from './ConnectorConfigDetails'

type ConnectorConfigSheetProps = {
  sheetOpen: boolean
  setSheetOpen: (open: boolean) => void
  setConnectorConfigId: (id: Id['ccfg'] | null) => void
  connectorConfigId: Id['ccfg'] | null
}

export function ConnectorConfigSheet({
  sheetOpen,
  setSheetOpen,
  setConnectorConfigId,
  connectorConfigId,
}: ConnectorConfigSheetProps) {
  const changedFieldsRef = useRef<string[]>([])
  const [connectorName, setConnectorName] = useState<ConnectorName | null>(null)

  const confirmAlert = useConfirm()

  const discardChanges = () => {
    setSheetOpen(false)
    setConnectorConfigId(null)
    changedFieldsRef.current = []
  }

  const handleSelectConnector = (connector: Core['connector']) => {
    setConnectorName(connector.name as ConnectorName)
  }

  const onOpenChange = async (open: boolean) => {
    if (connectorName) {
      setConnectorName(null)
    } else if (connectorConfigId) {
      if (changedFieldsRef.current.length > 0) {
        const confirmed = await confirmAlert({
          title: 'Discard Changes',
          description:
            'You have unsaved changes. Are you sure you want to discard these changes? All information will be lost.',
        })
        if (!confirmed) return
        discardChanges()
      }
      setConnectorConfigId(null)
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
              {connectorConfigId ? 'Edit Connector' : 'Add Connector'}
            </SheetTitle>
          </SheetHeader>
        </div>

        <div className="flex-1 overflow-y-auto">
          {!connectorConfigId && !connectorName ? (
            <AddConnectorConfigWrapper
              onSelectConnector={handleSelectConnector}
            />
          ) : (
            <ConnectorConfigDetails
              connectorConfigId={connectorConfigId ?? undefined}
              connectorName={connectorName ?? undefined}
              changedFieldsRef={changedFieldsRef}
              successCallback={() => {
                setSheetOpen(false)
                setConnectorConfigId(null)
                changedFieldsRef.current = []
              }}
            />
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
