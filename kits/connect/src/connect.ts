import type {ConnectProps} from './common'

import {createConnectIframe} from './common'
import {createModal} from './modal'

interface ConnectModalOptions {
  onClosed?: () => void
}

interface ConnectModalController {
  open: () => void
  close: () => void
  getIsOpen: () => boolean
  destroy: () => void
}

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
  // TODO: this hasn't been tested yet — test it out
  modal: (
    props: ConnectProps,
    options?: ConnectModalOptions,
  ): ConnectModalController => {
    const modalInstance = createModal(props, {
      onClosed: options?.onClosed,
    })
    // open by default
    modalInstance.open()
    // The createModal function already returns an object matching ModalInstance,
    // which aligns with ConnectModalController
    return modalInstance
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
