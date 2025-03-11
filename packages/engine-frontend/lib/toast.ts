// Simple toast utility to avoid dependency issues
export const toast = {
  success: (message: string, options?: { description?: string }) => {
    console.log(`SUCCESS: ${message}`, options?.description);
    // In a real implementation, this would call the actual toast library
  },
  error: (message: string, options?: { description?: string }) => {
    console.error(`ERROR: ${message}`, options?.description);
    // In a real implementation, this would call the actual toast library
  },
  info: (message: string, options?: { description?: string }) => {
    console.info(`INFO: ${message}`, options?.description);
    // In a real implementation, this would call the actual toast library
  },
  warning: (message: string, options?: { description?: string }) => {
    console.warn(`WARNING: ${message}`, options?.description);
    // In a real implementation, this would call the actual toast library
  },
  loading: (message: string, options?: { description?: string }) => {
    console.log(`LOADING: ${message}`, options?.description);
    // In a real implementation, this would call the actual toast library
    return "toast-id"; // Return a dummy ID
  },
  dismiss: (toastId: string) => {
    console.log(`DISMISS: ${toastId}`);
    // In a real implementation, this would call the actual toast library
  }
}; 