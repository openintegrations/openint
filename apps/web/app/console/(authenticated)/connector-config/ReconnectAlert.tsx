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

interface ReconnectAlertProps {
  showReconnectDialog: boolean
  setShowReconnectDialog: (show: boolean) => void
  handleConfirmReconnect: () => Promise<void>
}

export function ReconnectAlert({
  showReconnectDialog,
  setShowReconnectDialog,
  handleConfirmReconnect,
}: ReconnectAlertProps) {
  return (
    <AlertDialog
      open={showReconnectDialog}
      onOpenChange={setShowReconnectDialog}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>OAuth Credentials Changed</AlertDialogTitle>
          <AlertDialogDescription>
            You have changed the OAuth credentials. This will require
            reconnecting any existing connections using these credentials. Are
            you sure you want to proceed?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirmReconnect}>
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
