'use client'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@openint/shadcn/ui'

interface DiscardChangesAlertProps {
  connectorName: string
  showDiscardAlert: boolean
  setShowDiscardAlert: (show: boolean) => void
  discardChanges: () => void
}

export function DiscardChangesAlert({
  connectorName,
  showDiscardAlert,
  setShowDiscardAlert,
  discardChanges,
}: DiscardChangesAlertProps) {
  return (
    <AlertDialog open={showDiscardAlert} onOpenChange={setShowDiscardAlert}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Discard Changes</AlertDialogTitle>
          <AlertDialogDescription>
            You have made changes to the {connectorName} connector. Are you sure
            you want to discard these changes? All information will be lost.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={discardChanges}>
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
