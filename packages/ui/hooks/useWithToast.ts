import {useToast} from '@openint/shadcn/ui'

interface WithToastOptions {
  title?: string
  description?: string
}

export function useWithToast(defaultOptions: WithToastOptions = {}) {
  const {toast} = useToast()

  const onSuccessFn = (opts: WithToastOptions) => () =>
    toast.success(opts.title ?? 'Success', {
      description: opts.description,
    })

  const onErrorFn = (opts: WithToastOptions) => (err: unknown) =>
    toast.error(`Error: ${err}`, {
      description: opts.description,
    })

  const withToast = (
    fn: () => unknown,
    {
      showLoading = 'Running',
      ...options
    }: WithToastOptions & {
      showLoading?: string | false
    } = {},
  ) => {
    const opts = {...defaultOptions, ...options}
    let toastId: string | number | undefined
    
    if (showLoading) {
      toastId = toast.loading(showLoading)
    }

    return Promise.resolve(fn())
      .then((res) => {
        if (toastId) {
          toast.dismiss(toastId)
        }
        onSuccessFn(opts)()
        return res
      })
      .catch((err) => {
        if (toastId) {
          toast.dismiss(toastId)
        }
        onErrorFn(opts)(err)
      })
  }
  const onSuccess = onSuccessFn(defaultOptions)
  const onError = onErrorFn(defaultOptions)

  return {withToast, onSuccess, onError, toast}
}
