import {ConnectProps, createConnectIframe} from './common'

export const Connect = {
  embed: (
    props: ConnectProps & {
      containerRef: HTMLElement | string
    },
  ) => {
    let targetContainer: HTMLElement | null = null

    if (typeof props.containerRef === 'string') {
      targetContainer = document.querySelector(props.containerRef)
    } else {
      targetContainer = props.containerRef
    }

    if (targetContainer) {
      const iframeWrapper = createConnectIframe(props)

      // Clear existing content
      targetContainer.innerHTML = ''
      targetContainer.appendChild(iframeWrapper)
    } else {
      console.error(`Connect embed: container ${props.containerRef} not found`)
    }
  },
  modal: () => {
    console.error(
      'Modal mode is not yet supported. Please contact us at support@openint.dev if you need this feature.',
    )
    throw new Error(
      'Modal mode is not yet supported. Please contact us at support@openint.dev if you need this feature.',
    )
    // const controller = createConnectModal(props)
    // return controller.setOpen
  },
  redirect: () => {
    console.error(
      'Redirect mode is not yet supported. Please contact us at support@openint.dev if you need this feature.',
    )
    throw new Error(
      'Redirect mode is not yet supported. Please contact us at support@openint.dev if you need this feature.',
    )
  },
}
