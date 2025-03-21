import type {TRPCClientErrorLike} from '@trpc/react-query'
import type {UseTRPCMutationOptions} from '@trpc/react-query/dist/shared'
import {toast} from '@openint/ui-v1/components/toast'

/** Workaround for https://share.cleanshot.com/Yr1CMhLD */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function formatTRPCClientError(err: TRPCClientErrorLike<any>) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    const causes = JSON.parse(err.shape.message) as Array<{
      code: string
      message: string
    }>
    return causes[0]?.message
  } catch {
    return err.message
  }
}

export function useMutationToast(opts: {
  successMessage: string
  errorMessage: string
}) {
  return {
    onSuccess: () => {
      toast.success(opts.successMessage)
    },
    onError: (err) => {
      toast.error(opts.errorMessage, {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        description: formatTRPCClientError(err),
      })
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } satisfies UseTRPCMutationOptions<any, any, any, any>
}
