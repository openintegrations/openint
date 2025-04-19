import {toast as sonnerToast} from 'sonner'

// TODO: Remove this file move it to  ui-v1/components/toast.ts

/** @deprecated Use `toast` instead */
export function useToast() {
  return {toast: sonnerToast}
}

/** @deprecated Use `shadcn/ui/sonner` instead */
export const toast = sonnerToast

