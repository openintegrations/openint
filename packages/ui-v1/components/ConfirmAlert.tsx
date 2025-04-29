'use client'

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
}

interface ConfirmationContextType {
  confirmAlert: (options: ConfirmationOptions) => Promise<boolean>
}

const ConfirmationContext = createContext<ConfirmationContextType | null>(null)

export function ConfirmationProvider({children}: {children: React.ReactNode}) {
  const [isOpen, setIsOpen] = useState(false)
  const [options, setOptions] = useState<ConfirmationOptions | null>(null)
  const [resolve, setResolve] = useState<((value: boolean) => void) | null>(
    null,
  )

  const confirmAlert = useCallback(
    (options: ConfirmationOptions) => {
      return new Promise<boolean>((_resolve) => {
        setOptions(options)
        setResolve(() => _resolve)
        setIsOpen(true)
      })
    },
    [setOptions, setIsOpen],
  )

  const handleConfirm = () => {
    resolve?.(true)
    setIsOpen(false)
  }

  const handleCancel = () => {
    resolve?.(false)
    setIsOpen(false)
  }

  return (
    <ConfirmationContext.Provider value={{confirmAlert}}>
      {children}
      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
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
