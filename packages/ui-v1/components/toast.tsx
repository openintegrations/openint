import { toast as sonnerToast } from 'sonner'

// Create an enhanced toast object that extends the sonner toast
// with the same interface as your lib/toast.ts
export const toast = {
  // Direct export of the original sonner toast
  ...sonnerToast,
  
  // Enhanced methods with consistent interface
  success: (message: string, options?: { description?: string }) => {
    return sonnerToast.success(message, {
      description: options?.description,
    })
  },
  
  error: (message: string, options?: { description?: string }) => {
    return sonnerToast.error(message, {
      description: options?.description,
    })
  },
  
  info: (message: string, options?: { description?: string }) => {
    return sonnerToast.info(message, {
      description: options?.description,
    })
  },
  
  warning: (message: string, options?: { description?: string }) => {
    return sonnerToast.warning(message, {
      description: options?.description,
    })
  },
  
  loading: (message: string, options?: { description?: string }) => {
    return sonnerToast.loading(message, {
      description: options?.description,
    })
  },
  
  dismiss: (toastId: string) => {
    return sonnerToast.dismiss(toastId)
  }
}

// Also export the original toast for backward compatibility
export { sonnerToast }
