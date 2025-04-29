'use client'

import type {ReactNode} from 'react'

import {createContext, useCallback, useContext, useState} from 'react'
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

interface ConfirmationOptions {
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  variant?: 'default' | 'destructive'
  resolve?: (value: boolean) => void
}

interface ConfirmationContextType {
  confirmAlert: (options: ConfirmationOptions) => Promise<boolean>
}

const ConfirmationContext = createContext<ConfirmationContextType | null>(null)

export function ConfirmationProvider({children}: {children: ReactNode}) {
  const [options, setOptions] = useState<ConfirmationOptions | null>(null)

  const confirmAlert = useCallback((options: ConfirmationOptions) => {
    return new Promise<boolean>((_resolve) => {
      setOptions({...options, resolve: _resolve})
    })
  }, [])

  const handleConfirm = useCallback(() => {
    options?.resolve?.(true)
    setOptions(null)
  }, [options])

  const handleCancel = useCallback(() => {
    options?.resolve?.(false)
    setOptions(null)
  }, [options])

  return (
    <ConfirmationContext.Provider value={{confirmAlert}}>
      {children}
      <AlertDialog
        open={options !== null}
        onOpenChange={(open) => !open && setOptions(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{options?.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {options?.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancel}>
              {options?.cancelText || 'Cancel'}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              className={
                options?.variant === 'destructive' ? 'bg-destructive' : ''
              }>
              {options?.confirmText || 'Confirm'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ConfirmationContext.Provider>
  )
}

export function useConfirm() {
  const context = useContext(ConfirmationContext)
  if (!context) {
    throw new Error(
      'ConfirmationProvider not found. Please wrap your app with ConfirmationProvider',
    )
  }
  return context.confirmAlert
}
